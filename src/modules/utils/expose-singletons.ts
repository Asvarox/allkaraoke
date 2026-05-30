import CameraManager from '~/modules/camera/camera-manager';
import GameState from '~/modules/game-engine/game-state/game-state';
import inputManager from '~/modules/game-engine/input/input-manager';
import GameEvents from '~/modules/game-events/game-events';
import PlayersManager from '~/modules/players/players-manager';
import RemoteMicClient from '~/modules/remote-mic/network/client';
import RemoteMicServer from '~/modules/remote-mic/network/server';
import RemoteMicManager from '~/modules/remote-mic/remote-mic-manager';
import SongDao from '~/modules/songs/songs-service';
import * as SoundManager from '~/modules/sound-manager';
import UserMediaService from '~/modules/user-media/user-media-service';
import inputSources from '~/routes/select-input/input-sources/index';

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
    const importSongs = await import('~/modules/songs/utils/import-songs-from-post-hog');

    await importSongs.default();
  },
} as const;

declare global {
  var __exposeSingletons: () => void;
  var __singletons: typeof singletons;
}

global.__exposeSingletons = () => {
  global.__singletons = singletons;
};

if (process.env.NODE_ENV === 'development') {
  global.__exposeSingletons();
  console.log(global.__singletons);
} else {
  console.log(`Run global.__exposeSingletons() and inspect global.__singletons for debugging`);
}
