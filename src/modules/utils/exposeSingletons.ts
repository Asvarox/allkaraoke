import CameraManager from 'modules/Camera/CameraManager';
import GameState from 'modules/GameEngine/GameState/GameState';
import inputManager from 'modules/GameEngine/Input/InputManager';
import GameEvents from 'modules/GameEvents/GameEvents';
import PlayersManager from 'modules/Players/PlayersManager';
import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import RemoteMicServer from 'modules/RemoteMic/Network/Server';
import RemoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import SongDao from 'modules/Songs/SongsService';
import * as SoundManager from 'modules/SoundManager';
import UserMediaService from 'modules/UserMedia/userMediaService';
import inputSources from 'routes/SelectInput/InputSources';

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
  importSongs: async () => {
    const importSongs = await import('modules/Songs/utils/importSongsFromPostHog');

    await importSongs.default();
  },
} as const;

declare global {
  var __exposeSingletons: () => void;
  var __singletons: typeof singletons;
}

globalThis.__exposeSingletons = () => {
  globalThis.__singletons = singletons;
};

if (process.env.NODE_ENV === 'development') {
  globalThis.__exposeSingletons();
  console.log(globalThis.__singletons);
} else {
  console.log(`Run globalThis.__exposeSingletons() and inspect globalThis.__singletons for debugging`);
}
