import { Song, SongTrack } from '~/interfaces';
import { calculateDetailedScoreData, sumDetailedScore } from '~/modules/game-engine/game-state/helpers/calculate-score';

const maxWeight = (track: SongTrack) => sumDetailedScore(calculateDetailedScoreData([], track)[2]);

/**
 * What a merged-track run scored against `tracks[trackIndex]` (the pre-fix max score) must be
 * multiplied by to be scored against the merged track the player actually sang.
 */
export const getMergedTrackFactor = (song: Song, trackIndex: number) =>
  maxWeight(song.tracks[trackIndex]) / maxWeight(song.mergedTrack);
