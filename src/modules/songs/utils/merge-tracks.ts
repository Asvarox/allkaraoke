import { NotesSection, Song, SongTrack } from '~/interfaces';

import clearString from '../../utils/clear-string';
import { generatePlayerChangesForTrack } from './generate-player-changes';
import getSongBeatLength from './get-song-beat-length';
import isNotesSection from './is-notes-section';
import { getLastNoteEnd } from './notes-selectors';

// A held last note may be shortened to let the other singer's line in, but must keep this much of its length
const MIN_KEPT_NOTE_RATIO = 0.35;
// ...or its last syllable (e.g. a "~" continuation) may be dropped altogether, unless it's a long held note
const MAX_DROPPED_NOTES = 1;
const MAX_DROPPED_NOTE_MS = 1500;
// Lines like "Oh oh oh" or "La la la" - backing vocals that are not worth squeezing in between the main lines
const FILLER_MAX_WORD_LENGTH = 3;

interface Candidate {
  section: NotesSection;
  track: number;
}

const firstNoteStart = (section: NotesSection) => section.notes[0].start;

const overlaps = (a: NotesSection, b: NotesSection) =>
  firstNoteStart(a) < getLastNoteEnd(b) && firstNoteStart(b) < getLastNoteEnd(a);

const lyricsOf = (sections: NotesSection[]) => sections.flatMap((s) => s.notes.map((n) => n.lyrics)).join('');

const uniqueCharactersCount = (str: string) => new Set(clearString(str)).size;

const isFiller = (section: NotesSection) => {
  const words = new Set(lyricsOf([section]).split(/\s+/).map(clearString).filter(Boolean));
  return words.size <= 1 && [...words].every((word) => word.length <= FILLER_MAX_WORD_LENGTH);
};

/**
 * Makes the section end at `beat` by dropping at most one trailing note and shortening the (new) last note.
 * `null` if that would cut more than the tail of the line.
 */
const cutTail = (section: NotesSection, beat: number, maxDroppedBeats: number): NotesSection | null => {
  const kept = section.notes.filter((note) => note.start < beat);
  const dropped = section.notes.slice(kept.length);
  if (dropped.length > MAX_DROPPED_NOTES || kept.length < 2) return null;
  if (dropped.some((note) => note.length > maxDroppedBeats)) return null;

  const lastNote = kept.at(-1)!;
  const newLength = Math.min(lastNote.length, beat - lastNote.start);
  if (newLength < Math.max(1, lastNote.length * MIN_KEPT_NOTE_RATIO)) return null;

  return { ...section, notes: [...kept.slice(0, -1), { ...lastNote, length: newLength }] };
};

/** Groups sections (of both tracks) into clusters, where each section overlaps at least one other in its cluster. */
const clusterOverlapping = (candidates: Candidate[]) => {
  const sorted = [...candidates].sort((a, b) => firstNoteStart(a.section) - firstNoteStart(b.section));
  const clusters: Candidate[][] = [];
  let clusterEnd = -Infinity;

  sorted.forEach((candidate) => {
    if (firstNoteStart(candidate.section) >= clusterEnd) clusters.push([]);
    clusters.at(-1)!.push(candidate);
    clusterEnd = Math.max(clusterEnd, getLastNoteEnd(candidate.section));
  });

  return clusters;
};

/**
 * The track with the most distinct lyrics in a cluster is sung as is (the first track wins unless the other has
 * twice as many distinct letters and notes). The other track's lines are fitted in between where they don't
 * collide, or only collide with the tail of a held note, which then gets shortened.
 */
const resolveCluster = (cluster: Candidate[], maxDroppedBeats: number): Candidate[] => {
  const tracks = [...new Set(cluster.map((c) => c.track))].sort((a, b) => a - b);
  if (tracks.length === 1) return cluster;

  const [firstTrack, secondTrack] = tracks;
  const sectionsOf = (track: number) => cluster.filter((c) => c.track === track).map((c) => c.section);
  const [first, second] = [sectionsOf(firstTrack), sectionsOf(secondTrack)];
  const notesCount = (sections: NotesSection[]) => sections.reduce((sum, section) => sum + section.notes.length, 0);
  // Both, so a backing line only partially overlapping the lead's held note doesn't take the whole cluster over
  const secondIsRicher =
    (first.every(isFiller) && !second.every(isFiller)) ||
    (uniqueCharactersCount(lyricsOf(first)) / uniqueCharactersCount(lyricsOf(second)) < 0.5 &&
      notesCount(first) / notesCount(second) <= 0.5);
  const [winnerTrack, loserTrack] = secondIsRicher ? [secondTrack, firstTrack] : [firstTrack, secondTrack];

  const winners = sectionsOf(winnerTrack);
  const accepted: NotesSection[] = [];

  sectionsOf(loserTrack).forEach((original) => {
    if (winners.some((winner) => overlaps(winner, original)) && isFiller(original)) return;

    let loser: NotesSection | null = original;
    const fittedWinners = [...winners];
    for (let i = 0; i < fittedWinners.length && loser; i++) {
      const winner = fittedWinners[i];
      if (!overlaps(winner, loser)) continue;

      if (firstNoteStart(winner) < firstNoteStart(loser)) {
        const cut = cutTail(winner, firstNoteStart(loser), maxDroppedBeats);
        if (cut) fittedWinners[i] = cut;
        else loser = null;
      } else {
        loser = cutTail(loser, firstNoteStart(winner), maxDroppedBeats);
      }
    }

    if (loser && !accepted.some((section) => overlaps(section, loser!))) {
      winners.splice(0, winners.length, ...fittedWinners);
      accepted.push(loser);
    }
  });

  return [
    ...winners.map((section) => ({ section, track: winnerTrack })),
    ...accepted.map((section) => ({ section, track: loserTrack })),
  ];
};

export default function mergeTracks(tracks: Song['tracks'], song: Song) {
  if (!tracks) {
    return tracks;
  } else if (tracks.length === 1) {
    return tracks[0];
  }
  const candidates = tracks.slice(0, 2).flatMap((track, index) =>
    track.sections
      .filter(isNotesSection)
      .filter((section) => section.notes.length > 0)
      .map((section) => ({ section, track: index })),
  );

  const maxDroppedBeats = MAX_DROPPED_NOTE_MS / getSongBeatLength(song);
  const merged = clusterOverlapping(candidates)
    .flatMap((cluster) => resolveCluster(cluster, maxDroppedBeats))
    .sort((a, b) => firstNoteStart(a.section) - firstNoteStart(b.section));

  // The other track's line may break before the previous line's last note ends - keep the sections sequential
  const finalSections = merged.map(({ section, track }, index) => {
    const previous = merged[index - 1];
    if (!previous || previous.track === track) return section;

    const start = Math.min(Math.max(section.start, getLastNoteEnd(previous.section)), firstNoteStart(section));
    return { ...section, start };
  });

  const finalTrack: SongTrack = {
    ...tracks[0],
    sections: finalSections,
    changes: [],
  };

  finalTrack.changes = generatePlayerChangesForTrack(finalTrack, song);

  return finalTrack;
}
