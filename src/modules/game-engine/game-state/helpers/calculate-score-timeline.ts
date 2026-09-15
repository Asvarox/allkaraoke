import { noPointsNoteTypes } from '~/consts';
import { DetailedScore, PlayerNote, Song, songBeat } from '~/interfaces';
import {
  beatsToPoints,
  calculateDetailedScoreData,
  countsToBeats,
  emptyDetailedScore,
} from '~/modules/game-engine/game-state/helpers/calculate-score';
import getPlayerNoteDistance from '~/modules/game-engine/helpers/get-player-note-distance';
import getSongBeatCount from '~/modules/songs/utils/get-song-beat-count';

/**
 * A player's running score, sampled at even points across the song. Index 0 is the start of the song
 * (all zeroes) and the last index is the end, so `timeline.length` is `SCORE_TIMELINE_SAMPLES + 1`
 * and the last entry equals the final detailed score.
 */
export type ScoreTimeline = DetailedScore[];

/** Enough samples that the results-screen line looks like a curve rather than a polygon, while
 * staying cheap enough to compute for every player at once when the screen mounts. */
export const SCORE_TIMELINE_SAMPLES = 120;

/** Same two filters `calculateDetailedScoreData` applies, so a timeline adds up to the score it
 * returns rather than to a slightly different number. */
const scoringNotesOf = (playerNotes: PlayerNote[]) =>
  playerNotes.filter((note) => !noPointsNoteTypes.includes(note.note.type) && getPlayerNoteDistance(note) === 0);

/**
 * The beat every player's timeline ends on.
 *
 * Shared across players on purpose. The results screen samples every timeline at the same progress,
 * so a per-player endpoint would make one progress value mean a different moment of the song for
 * each of them — the board and the chart would be comparing different points of the same replay,
 * and co-op would average samples taken at different beats.
 *
 * The song's own length normally ends last, but a note sung past it would be cut off the end of the
 * timeline and lost, leaving that player's final sample short of their real total.
 */
export function getTimelineEndBeat(song: Song, playerNotes: PlayerNote[][]): songBeat {
  return playerNotes
    .flatMap(scoringNotesOf)
    .reduce((end, note) => Math.max(end, note.start + note.length), Math.max(getSongBeatCount(song), 1));
}

export function calculateScoreTimeline(
  playerNotes: PlayerNote[],
  song: Song,
  trackNumber: number,
  /** From {@link getTimelineEndBeat}, computed once across every player sharing the screen. */
  endBeat: songBeat,
  sampleCount: number = SCORE_TIMELINE_SAMPLES,
): ScoreTimeline {
  const [pointsPerBeat] = calculateDetailedScoreData(playerNotes, song, trackNumber);
  const scoringNotes = scoringNotesOf(playerNotes);

  const timeline: ScoreTimeline = [];
  for (let sample = 0; sample <= sampleCount; sample++) {
    const beat = (endBeat * sample) / sampleCount;
    const counts = emptyDetailedScore();

    for (const note of scoringNotes) {
      // A note still being sung at this beat counts for the part of it already sung, so the line
      // climbs through a long note instead of jumping when it ends.
      const sungLength = Math.max(0, Math.min(note.length, beat - note.start));
      if (sungLength === 0) continue;

      counts[note.note.type] = counts[note.note.type] + sungLength;
      if (note.isPerfect) counts.perfect = counts.perfect + sungLength;
      if (note.vibrato) counts.vibrato = counts.vibrato + sungLength;
    }

    timeline.push(beatsToPoints(countsToBeats(counts), pointsPerBeat));
  }

  return timeline;
}
