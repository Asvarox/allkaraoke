import CameraManager from 'Camera/CameraManager';
import GameEvents from 'GameEvents/GameEvents';
import PlayersManager from 'Players/PlayersManager';
import RemoteMicClient from 'RemoteMic/Network/Client';
import RemoteMicServer from 'RemoteMic/Network/Server';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import inputManager from 'Scenes/Game/Singing/Input/InputManager';
import inputSources from 'Scenes/SelectInput/InputSources';
import SongDao from 'Songs/SongsService';
import * as SoundManager from 'SoundManager';
import UserMediaService from 'UserMedia/userMediaService';

const singletons = {
  RemoteMicClient,
  RemoteMicServer,
  GameState,
  GameEvents,
  RemoteMicManager,
  SongDao,
  InputManager: inputManager,
  InputSourceManager: inputSources,
  CameraManager,
  UserMediaService,
  PlayersManager,
  SoundManager,
} as const;

declare global {
  interface Window {
    __exposeSingletons: () => void;
    __singletons: typeof singletons;
  }
}

window.__exposeSingletons = () => {
  window.__singletons = singletons;
};

if (process.env.NODE_ENV === 'development') {
  window.__exposeSingletons();
  console.log(window.__singletons);
} else {
  console.log(`Run window.__exposeSingletons() and inspect window.__singletons for debugging`);
}
