import WebRTCClient from 'RemoteMic/Network/WebRTCClient';
import WebRTCServer from 'RemoteMic/Network/WebRTCServer';
import PhoneManager from 'RemoteMic/PhoneManager';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import GameStateEvents from 'Scenes/Game/Singing/GameState/GameStateEvents';

// @ts-ignore
window.__exposeSingletons = () => {
    // @ts-ignore
    window.__singletons = {
        WebRTCClient,
        WebRTCServer,
        GameState,
        GameStateEvents,
        PhoneManager,
    };
};

console.log(`Run window.__exposeSingletons() and inspect window.__singletons for debugging`);
