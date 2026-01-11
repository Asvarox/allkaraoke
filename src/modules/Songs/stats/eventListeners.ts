import localForage from 'localforage';
import events from '~/modules/GameEvents/GameEvents';
import { getSongKey, SongStats, storeSongStats } from '~/modules/Songs/stats/common';

events.songEnded.subscribe(async (song, setup, scores, progress) => {
  if (scores.every((score) => score.score === 0)) {
    return;
  }
  let currentState = await localForage?.getItem<SongStats>(getSongKey(song));

  const score = { setup, scores, date: new Date().toISOString(), progress };
  if (currentState) {
    // there might be cases where only { plays: number } is stored
    currentState.scores = [...(currentState?.scores ?? []), score];
    currentState.plays = currentState.scores.length;
  } else {
    currentState = {
      plays: 1,
      scores: [score],
    };
  }

  await storeSongStats(song, currentState);
  events.songStatStored.dispatch(getSongKey(song), currentState);
});
