import { randomInt } from '~/modules/utils/randomValue';

const MAX_REMEMBERED_SONGS_COUNT = 30;
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
