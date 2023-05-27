import { randomInt } from 'utils/randomValue';

const MAX_REMEMBERED_SONGS_COUNT = 30;
export default function selectRandomSong(
    songCount: number,
    previouslySelectedSongs: number[],
    maxRememberedCount = MAX_REMEMBERED_SONGS_COUNT,
) {
    let newIndex = null;
    while (newIndex === null || previouslySelectedSongs.includes(newIndex)) {
        newIndex = randomInt(0, songCount - 1);
    }

    if (previouslySelectedSongs.length >= maxRememberedCount) {
        previouslySelectedSongs.shift();
    }
    previouslySelectedSongs.push(newIndex);

    return newIndex;
}
