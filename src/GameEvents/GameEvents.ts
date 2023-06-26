import { PeerErrorType, SingSetup, Song, SongPreview } from 'interfaces';
import posthog from 'posthog-js';
import { SelectedPlayerInput } from 'Scenes/Game/Singing/Input/InputManager';
import { SongStats } from 'Songs/stats/common';
import { keyStrokes } from 'RemoteMic/Network/events';
import { HelpEntry } from 'Scenes/KeyboardHelp/Context';

export class GameEvent<T extends (...args: any[]) => void> {
    protected subscribers: Array<T> = [];

    public subscribe = (callback: T) => {
        this.unsubscribe(callback);
        this.subscribers.push(callback);
    };

    public unsubscribe = (callback: T) => {
        this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };

    public dispatch = (...args: Parameters<T>) => {
        console.log('dispatch', this.name, ...args);
        this.subscribers.forEach((callback) => callback(...args));

        if (this.track) {
            posthog.capture(this.name, this.track instanceof Function ? this.track(...args) : args);
        }
    };

    public constructor(private name: string, private track: boolean | ((...args: Parameters<T>) => any) = false) {}
}

export const events = {
    sectionChange: new GameEvent<(player: number, previousSectionIndex: number) => void>('sectionChange'),
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
    playerInputChanged: new GameEvent<
        (playerNumber: number, oldInput: SelectedPlayerInput | undefined, newInput: SelectedPlayerInput) => void
    >('playerInputChanged', (player, oldI, newI) => ({ player, old: oldI?.source, new: newI.source })),
    inputListChanged: new GameEvent<(initial: boolean) => void>('inputListChanged'),

    karaokeConnectionStatusChange: new GameEvent<
        (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error', e?: PeerErrorType) => void
    >('karaokeConnectionStatusChange'),
    remoteMicPlayerNumberSet: new GameEvent<(playerNumber: number | null) => void>('remoteMicPlayerNumberSet'),
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

    remoteKeyboardPressed: new GameEvent<(key: keyStrokes) => void>('remoteKeyboardPressed', true),
    remoteKeyboardLayout: new GameEvent<(help: HelpEntry | undefined) => void>('remoteKeyboardLayout'),
    remoteReadinessRequested: new GameEvent('remoteReadinessRequested'),
    readinessConfirmed: new GameEvent<(deviceId: string) => void>('remoteReadinessConfirmed'),
};

export default events;
