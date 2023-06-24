import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import WebRTCServer from 'RemoteMic/Network/WebRTCServer';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import GameEvents from 'GameEvents/GameEvents'; // @ts-ignore
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import SongDao from 'Songs/SongDao';
import inputManager from 'Scenes/Game/Singing/Input/InputManager';
import inputSources from 'Scenes/SelectInput/InputSources';
import UserMediaService from 'UserMedia/userMediaService';
import CameraManager from 'Camera/CameraManager';

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
    };
};

console.log(`Run window.__exposeSingletons() and inspect window.__singletons for debugging`);
