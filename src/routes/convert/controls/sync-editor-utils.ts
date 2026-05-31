import { cloneDeep } from 'es-toolkit';
import { NotesSection, Section, Song } from '~/interfaces';
import normaliseLyricSpaces from '~/modules/songs/utils/process-song/normalise-lyric-spaces';
import normaliseSectionPaddings from '~/modules/songs/utils/process-song/normalise-section-paddings';
import { SyncLyricChanges } from '~/routes/convert/convert-form-context';
import { ChangeRecord } from '~/routes/convert/steps/sync-lyrics-to-video/components/edit-section';

const shiftGap = (song: Song, gapShift: number): Song => ({ ...song, gap: song.gap + gapShift });
const shiftVideoGap = (song: Song, gapShift: number): Song => ({ ...song, videoGap: (song.videoGap ?? 0) + gapShift });
const setBpm = (song: Song, bpm: number): Song => ({ ...song, bpm });
const isNotesSection = (section: Section): section is NotesSection => section.type === 'notes';

const applyChanges = (song: Song, changes: ChangeRecord[]) => ({
  ...song,
  tracks: song.tracks.map((track, trackIndex) => {
    const changeList = changes.filter((change) => change.track === trackIndex);

    let noteSections = track.sections.filter(isNotesSection);

    changeList.forEach((change) => {
      if (change.type === 'delete') {
        noteSections = noteSections.filter((_, index) => index !== change.section);
      } else if (change.type === 'shift') {
        const shift = change.shift - (noteSections[change.section]?.notes?.[0]?.start ?? 0);
        noteSections = noteSections.map((section, index) => {
          if (index < change.section) return section;

          return { ...section, notes: section.notes.map((note) => ({ ...note, start: note.start + shift })) };
        });
      }
    });

    let currentNoteSection = 0;
    const sections = track.sections.reduce<Section[]>((nextSections, section) => {
      if (!isNotesSection(section)) {
        nextSections.push(section);
        return nextSections;
      }

      const updatedSection = noteSections[currentNoteSection];
      currentNoteSection += 1;

      if (updatedSection) {
        nextSections.push(updatedSection);
      }

      return nextSections;
    }, []);

    return { ...track, sections };
  }),
});

const applyTrackNames = (song: Song, trackNames: (string | undefined)[]): Song => ({
  ...song,
  tracks: song.tracks.map((track, index) => ({
    ...track,
    name: trackNames[index] ?? track.name,
  })),
});

const applyLyricChanges = (song: Song, lyricChanges: SyncLyricChanges) => ({
  ...song,
  tracks: song.tracks.map((track, trackIndex) => {
    const trackLyricChanges = lyricChanges[trackIndex] ?? {};

    return {
      ...track,
      sections: track.sections.map((section, sectionIndex) => {
        const sectionLyricChanges = trackLyricChanges[sectionIndex] ?? {};

        if (section.type !== 'notes') return section;

        return {
          ...section,
          notes: section.notes.map((note, noteIndex) => ({
            ...note,
            lyrics: sectionLyricChanges[noteIndex] ?? note.lyrics,
          })),
        };
      }),
    };
  }),
});

interface ApplySyncDeltasInput {
  baseSong: Song;
  changeRecords: ChangeRecord[];
  gapShift: string;
  lyricChanges: SyncLyricChanges;
  overrideBpm: number;
  trackNames: (string | undefined)[];
  videoGapShift: number;
}

export function applySyncDeltas({
  baseSong,
  gapShift,
  videoGapShift,
  overrideBpm,
  changeRecords,
  trackNames,
  lyricChanges,
}: ApplySyncDeltasInput): Song {
  let processed = cloneDeep(baseSong);

  if (!isNaN(Number(gapShift))) {
    processed = shiftGap(processed, Number(gapShift));
  }

  processed = shiftVideoGap(processed, videoGapShift);
  processed = setBpm(processed, overrideBpm);
  processed = applyChanges(processed, changeRecords);
  processed = applyTrackNames(processed, trackNames);
  processed = applyLyricChanges(processed, lyricChanges);
  processed = normaliseSectionPaddings(processed);
  processed = normaliseLyricSpaces(processed);

  return processed;
}
