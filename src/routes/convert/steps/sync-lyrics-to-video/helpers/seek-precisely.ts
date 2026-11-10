import { seconds } from '~/interfaces';
import sleep from '~/modules/utils/sleep';
import { PlayerRef } from '~/routes/game/singing/player';

const TOLERANCE: seconds = 0.2;
const POLL_INTERVAL_MS = 100;
const MAX_POLLS = 30;
const MAX_RESEEKS = 2;

/**
 * YouTube seeks to the closest keyframe before the target (often 1-2s early) unless that part is already buffered.
 * So once playback advances from the early landing spot (the segment is buffered by then), seek again to the exact time.
 */
export default async function seekPrecisely(player: PlayerRef, target: seconds, isStale: () => boolean) {
  player.seekTo(target);
  player.play();

  let reseeksLeft = MAX_RESEEKS;
  let previousTime: seconds | null = null;

  for (let poll = 0; poll < MAX_POLLS && reseeksLeft > 0; poll++) {
    await sleep(POLL_INTERVAL_MS);
    if (isStale()) return;

    const currentTime = (await player.getCurrentTime()) / 1000;
    if (currentTime >= target - TOLERANCE) return;

    const isAdvancing = previousTime !== null && currentTime > previousTime;
    previousTime = currentTime;

    if (isAdvancing) {
      reseeksLeft--;
      previousTime = null;
      player.seekTo(target);
    }
  }
}
