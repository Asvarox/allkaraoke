import { SingSetup, Song, SongPreview } from 'interfaces';
import { PlayerEntity, SelectedPlayerInput } from 'modules/Players/PlayersManager';
import { transportErrorReason } from 'modules/RemoteMic/Network/Client/NetworkClient';
import {
  keyStrokes,
  NetworkRemoteMicListMessage,
  NetworkRemoteMicMyListMessage,
  NetworkSetPermissionsMessage,
  NetworkStyleChangeMessage,
  NetworkSubscribeMessage,
} from 'modules/RemoteMic/Network/messages';
import { SongStats } from 'modules/Songs/stats/common';
import posthog from 'posthog-js';
import { HelpEntry } from 'routes/KeyboardHelp/Context';

export class GameEvent<T extends (...args: any[]) => void> {
  protected subscribers: Array<T> = [];
  public lastParams: Parameters<T> | null = null;

  public subscribe = (callback: T, getLast = false) => {
    this.unsubscribe(callback);
    this.subscribers.push(callback);
    if (getLast && this.lastParams !== null) {
      callback(...this.lastParams);
    }
  };

  public unsubscribe = (callback: T) => {
    this.subscribers = this.subscribers.filter((cb) => cb !== callback);
  };

  public dispatch = (...args: Parameters<T>) => {
    this.log && console.log('dispatch', this.name, ...args);
    this.subscribers.forEach((callback) => callback(...args));
    this.lastParams = args;

    if (this.track) {
      posthog.capture(this.name, this.track instanceof Function ? this.track(...args) : args);
    }
  };

  public constructor(
    private name: string,
    private track: boolean | ((...args: Parameters<T>) => any) = false,
    private log = true,
  ) {}
}

export const events = {
  sectionChange: new GameEvent<(player: 0 | 1 | 2 | 3, previousSectionIndex: number) => void>(
    'sectionChange',
    false,
    false,
  ),
  // newPlayerNote: new GameEvent<(player: 0 | 1 |2 | 3, playerNote: PlayerNote) => void>('//', true),
  // playerNoteUpdate: new GameEvent<(player: 0 | 1 |2 | 3, playerNote: PlayerNote) => void>('//', true),

  playerAdded: new GameEvent<(playerNumber: 0 | 1 | 2 | 3) => void>('playerAdded', false),
  playerRemoved: new GameEvent<(player: PlayerEntity) => void>('playerRemoved', false),

  songStarted: new GameEvent<(song: Song | SongPreview, singSetup: SingSetup) => void>('songStarted', false),
  songEnded: new GameEvent<
    (
      song: Song | SongPreview,
      singSetup: SingSetup,
      scores: Array<{ name: string; score: number }>,
      progress: number,
    ) => void
  >('songEnded', false),

  remoteMicConnected: new GameEvent<(remoteMic: { id: string; name: string; silent: boolean }) => void>(
    'remoteMicConnected',
  ),
  remoteMicDisconnected: new GameEvent<(remoteMic: { id: string; name: string }, silent: boolean) => void>(
    'remoteMicDisconnected',
  ),
  playerNameChanged: new GameEvent<(playerNumber: 0 | 1 | 2 | 3, oldName: string | undefined) => void>(
    'playerNameChanged',
  ),
  playerInputChanged: new GameEvent<
    (
      playerNumber: 0 | 1 | 2 | 3,
      oldInput: SelectedPlayerInput | undefined,
      newInput: SelectedPlayerInput | undefined,
    ) => void
  >('playerInputChanged'),
  inputListChanged: new GameEvent<(initial: boolean) => void>('inputListChanged'),

  karaokeConnectionStatusChange: new GameEvent<
    (
      status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error' | 'uninitialised',
      e?: transportErrorReason,
    ) => void
  >('karaokeConnectionStatusChange'),
  remoteMicPlayerSet: new GameEvent<(playerNumber: 0 | 1 | 2 | 3 | null) => void>('remoteMicPlayerSet'),
  remoteMicMonitoringStarted: new GameEvent('remoteMicMonitoringStarted'),
  remoteMicMonitoringStopped: new GameEvent('remoteMicMonitoringStopped'),

  micMonitoringStarted: new GameEvent('micMonitoringStarted'),
  micMonitoringStopped: new GameEvent('micMonitoringStopped'),
  playerChangeRequested: new GameEvent<(remoteMicId: string, newPlayerNumber: 0 | 1 | 2 | 3 | null) => void>(
    'playerChangeRequested',
    true,
  ),

  songStatStored: new GameEvent<(key: string, stats: SongStats) => void>('songStatStored'),
  songScoreUpdated: new GameEvent<(key: string, stats: SongStats, newName: string) => void>(
    'songScoreUpdated',
    () => undefined,
  ),

  remoteMicSubscribed: new GameEvent<(id: string, channel: NetworkSubscribeMessage['channel']) => void>(
    'remoteMicSubscribed',
  ),
  remoteKeyboardPressed: new GameEvent<(key: keyStrokes) => void>('remoteKeyboardPressed'),
  remoteSongSearch: new GameEvent<(search: string) => void>('remoteSongSearch'),
  remoteSongSelected: new GameEvent<(search: string) => void>('remoteSongSelected', true),
  remoteMicListUpdated: new GameEvent<(list: NetworkRemoteMicListMessage['list']) => void>('remoteMicListUpdated'),
  remoteMicSongListUpdated: new GameEvent<(id: string, delta: Omit<NetworkRemoteMicMyListMessage, 't'>) => void>(
    'remoteMicSongListUpdate',
  ),
  remoteKeyboardLayout: new GameEvent<(help: HelpEntry | undefined) => void>('remoteKeyboardLayout'),
  remoteReadinessRequested: new GameEvent('remoteReadinessRequested'),
  remoteStyleChanged: new GameEvent<(style: NetworkStyleChangeMessage['style']) => void>('remoteStyleChanged'),
  remoteMicPermissionsSet: new GameEvent<(level: NetworkSetPermissionsMessage['level']) => void>(
    'remoteMicPermissionsSet',
  ),
  readinessConfirmed: new GameEvent<(deviceId: string) => void>('remoteReadinessConfirmed'),
  minPlayerNumberChanged: new GameEvent<(previous: number, current: number) => void>('minPlayerNumberChanged'),

  micServerStarted: new GameEvent('micServerStarted'),
  micServerStopped: new GameEvent('micServerStopped'),

  noteStarted: new GameEvent('noteStarted', false, false),
};

export default events;
