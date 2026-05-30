import { randomInt } from '~/modules/utils/random-value';

const MAX_REMEMBERED_SONGS_COUNT = 30;
/**
 * Picks a random song index that hasn't been played recently.
 * Intentionally mutates `previouslySelectedSongs` in place so the caller's array
 * acts as a circular history buffer across calls without needing to re-assign it.
 */
export default function selectRandomSong(
  songCount: number,
  previouslySelectedSongs: number[],
  maxRememberedCount = MAX_REMEMBERED_SONGS_COUNT,
) {
  let newIndex;
  if (previouslySelectedSongs.length < songCount) {
    const possibleOptions = [...Array(songCount).keys()].filter((id) => !previouslySelectedSongs.includes(id));

    newIndex = possibleOptions[randomInt(0, possibleOptions.length - 1)];
  } else {
    newIndex = randomInt(0, songCount - 1);

    previouslySelectedSongs.length = 0;
  }

  if (previouslySelectedSongs.length >= maxRememberedCount) {
    previouslySelectedSongs.shift();
  }
  previouslySelectedSongs.push(newIndex);

  return newIndex;
}
