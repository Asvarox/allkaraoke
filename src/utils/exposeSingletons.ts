import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import WebRTCServer from 'RemoteMic/Network/WebRTCServer';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import GameEvents from 'GameEvents/GameEvents'; // @ts-ignore
import RemoteMicManager from 'RemoteMic/RemoteMicManager';

// @ts-ignore
window.__exposeSingletons = () => {
    // @ts-ignore
    window.__singletons = {
        WebRTCClient,
        WebRTCServer,
        GameState,
        GameEvents,
        RemoteMicManager,
    };
};

console.log(`Run window.__exposeSingletons() and inspect window.__singletons for debugging`);
