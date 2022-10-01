import localForage from 'localforage';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { getSongKey, SongStats } from 'Stats/Song/common';

events.songStarted.subscribe(async (song, setup) => {
    let currentState = await localForage.getItem<SongStats>(getSongKey(song));

    if (currentState) {
        currentState.plays++;
    } else {
        currentState = {
            plays: 1,
            scores: [],
        };
    }

    await localForage.setItem<SongStats>(getSongKey(song), currentState);
});

events.songEnded.subscribe(async (song, setup, scores) => {
    let currentState = await localForage.getItem<SongStats>(getSongKey(song));

    const score = { setup, scores, date: new Date().toISOString() };
    if (currentState) {
        // there might be cases where only { plays: number } is stored
        currentState.scores = [...(currentState?.scores ?? []), score];
    } else {
        currentState = {
            plays: 1,
            scores: [score],
        };
    }

    await localForage.setItem<SongStats>(getSongKey(song), currentState);
});
