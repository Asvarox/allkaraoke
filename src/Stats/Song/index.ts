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
        };
    }

    await localForage.setItem<SongStats>(getSongKey(song), currentState);
});
