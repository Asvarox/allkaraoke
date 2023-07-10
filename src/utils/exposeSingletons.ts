import CameraManager from 'Camera/CameraManager';
import GameEvents from 'GameEvents/GameEvents'; // @ts-ignore
import PlayersManager from 'Players/PlayersManager';
import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import WebRTCServer from 'RemoteMic/Network/WebRTCServer';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import inputManager from 'Scenes/Game/Singing/Input/InputManager';
import inputSources from 'Scenes/SelectInput/InputSources';
import SongDao from 'Songs/SongDao';
import UserMediaService from 'UserMedia/userMediaService';

// @ts-ignore
window.__exposeSingletons = () => {
    // @ts-ignore
    window.__singletons = {
        WebRTCClient,
        WebRTCServer,
        GameState,
        GameEvents,
        RemoteMicManager,
        SongDao,
        InputManager: inputManager,
        InputSourceManager: inputSources,
        CameraManager,
        UserMediaService,
        PlayersManager,
    };
};

if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    window.__exposeSingletons();
    // @ts-ignore
    console.log(window.__singletons);
} else {
    console.log(`Run window.__exposeSingletons() and inspect window.__singletons for debugging`);
}
