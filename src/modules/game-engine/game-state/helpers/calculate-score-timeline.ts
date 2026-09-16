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
 * A player's running score, sampled at even points across a {@link TimelineRange}. Index 0 is the
 * start of the range (all zeroes, since nobody has scored before it) and the last index is its end,
 * so `timeline.length` is `SCORE_TIMELINE_SAMPLES + 1` and the last entry equals the final detailed
 * score.
 */
export type ScoreTimeline = DetailedScore[];

/** Enough samples that the results-screen line looks like a curve rather than a polygon, while
 * staying cheap enough to compute for every player at once when the screen mounts. */
export const SCORE_TIMELINE_SAMPLES = 120;

/** Same two filters `calculateDetailedScoreData` applies, so a timeline adds up to the score it
 * returns rather than to a slightly different number. */
const scoringNotesOf = (playerNotes: PlayerNote[]) =>
  playerNotes.filter((note) => !noPointsNoteTypes.includes(note.note.type) && getPlayerNoteDistance(note) === 0);

/** The stretch of the song a set of timelines covers, in beats. */
export interface TimelineRange {
  startBeat: songBeat;
  endBeat: songBeat;
}

/**
 * The stretch of the song worth replaying: from the first beat anyone scored on to the last.
 *
 * An intro before anyone sings and an outro after everyone has finished leave every line flat, so
 * they are cut rather than replayed as dead air — and cutting them here, before sampling, gives the
 * whole sample budget to the part where scores actually move.
 *
 * Shared across players on purpose. The results screen samples every timeline at the same progress,
 * so a per-player range would make one progress value mean a different moment of the song for each
 * of them — the board and the chart would be comparing different points of the same replay, and
 * co-op would average samples taken at different beats. A player who scored early therefore keeps
 * everyone's replay starting early, and one who sang past the song's last beat keeps it running.
 *
 * When nobody scored at all there is nothing to trim towards, so the range is the whole song.
 */
export function getTimelineRange(song: Song, playerNotes: PlayerNote[][]): TimelineRange {
  const scoringNotes = playerNotes.flatMap(scoringNotesOf);
  const startBeat = Math.min(...scoringNotes.map((note) => note.start));
  const endBeat = Math.max(...scoringNotes.map((note) => note.start + note.length));

  if (!scoringNotes.length || endBeat <= startBeat) {
    return { startBeat: 0, endBeat: Math.max(getSongBeatCount(song), 1) };
  }

  return { startBeat, endBeat };
}

export function calculateScoreTimeline(
  playerNotes: PlayerNote[],
  song: Song,
  trackNumber: number,
  /** From {@link getTimelineRange}, computed once across every player sharing the screen. */
  { startBeat, endBeat }: TimelineRange,
  sampleCount: number = SCORE_TIMELINE_SAMPLES,
): ScoreTimeline {
  const [pointsPerBeat] = calculateDetailedScoreData(playerNotes, song, trackNumber);
  const scoringNotes = scoringNotesOf(playerNotes);

  const timeline: ScoreTimeline = [];
  for (let sample = 0; sample <= sampleCount; sample++) {
    const beat = startBeat + ((endBeat - startBeat) * sample) / sampleCount;
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
