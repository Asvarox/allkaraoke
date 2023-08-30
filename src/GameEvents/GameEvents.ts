import { SelectedPlayerInput } from 'Players/PlayersManager';
import { transportErrorReason } from 'RemoteMic/Network/Client/NetworkClient';
import {
    NetworkRemoteMicListMessage,
    NetworkSetPermissionsMessage,
    NetworkSubscribeMessage,
    keyStrokes,
} from 'RemoteMic/Network/messages';
import { HelpEntry } from 'Scenes/KeyboardHelp/Context';
import { SongStats } from 'Songs/stats/common';
import { SingSetup, Song, SongPreview } from 'interfaces';
import posthog from 'posthog-js';

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
    sectionChange: new GameEvent<(player: number, previousSectionIndex: number) => void>(
        'sectionChange',
        undefined,
        false,
    ),
    // newPlayerNote: new GameEvent<(player: number, playerNote: PlayerNote) => void>('//', true),
    // playerNoteUpdate: new GameEvent<(player: number, playerNote: PlayerNote) => void>('//', true),

    songStarted: new GameEvent<(song: Song | SongPreview, singSetup: SingSetup) => void>('songStarted', false),
    songEnded: new GameEvent<
        (song: Song | SongPreview, singSetup: SingSetup, scores: Array<{ name: string; score: number }>) => void
    >('songEnded', false),

    remoteMicConnected: new GameEvent<(remoteMic: { id: string; name: string; silent: boolean }) => void>(
        'remoteMicConnected',
    ),
    remoteMicDisconnected: new GameEvent<(remoteMic: { id: string; name: string }, silent: boolean) => void>(
        'remoteMicDisconnected',
    ),
    playerNameChanged: new GameEvent<(playerNumber: number, oldName: string | undefined) => void>('playerNameChanged'),
    playerInputChanged: new GameEvent<
        (playerNumber: number, oldInput: SelectedPlayerInput | undefined, newInput: SelectedPlayerInput) => void
    >('playerInputChanged', (player, oldI, newI) => ({ player, old: oldI?.source, new: newI.source })),
    inputListChanged: new GameEvent<(initial: boolean) => void>('inputListChanged'),

    karaokeConnectionStatusChange: new GameEvent<
        (
            status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error',
            e?: transportErrorReason,
        ) => void
    >('karaokeConnectionStatusChange'),
    remoteMicPlayerSet: new GameEvent<(playerNumber: number | null) => void>('remoteMicPlayerSet'),
    remoteMicMonitoringStarted: new GameEvent('remoteMicMonitoringStarted'),
    remoteMicMonitoringStopped: new GameEvent('remoteMicMonitoringStopped'),

    micMonitoringStarted: new GameEvent('micMonitoringStarted'),
    micMonitoringStopped: new GameEvent('micMonitoringStopped'),
    playerChangeRequested: new GameEvent<(remoteMicId: string, newPlayerNumber: number | null) => void>(
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
    remoteKeyboardPressed: new GameEvent<(key: keyStrokes) => void>('remoteKeyboardPressed', true),
    remoteSongSearch: new GameEvent<(search: string) => void>('remoteSongSearch', true),
    remoteMicListUpdated: new GameEvent<(list: NetworkRemoteMicListMessage['list']) => void>('remoteMicListUpdated'),
    remoteKeyboardLayout: new GameEvent<(help: HelpEntry | undefined) => void>('remoteKeyboardLayout'),
    remoteReadinessRequested: new GameEvent('remoteReadinessRequested'),
    remoteMicPermissionsSet: new GameEvent<(level: NetworkSetPermissionsMessage['level']) => void>(
        'remoteMicPermissionsSet',
    ),
    readinessConfirmed: new GameEvent<(deviceId: string) => void>('remoteReadinessConfirmed'),
};

export default events;
