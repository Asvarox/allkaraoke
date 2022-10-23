import { SingSetup, Song, SongPreview } from 'interfaces';
import posthog from 'posthog-js';
import { SelectedPlayerInput } from 'Scenes/Game/Singing/Input/InputManager';
import { SongStats } from 'Stats/Song/common';
import isDev from 'utils/isDev';

export class GameStateEvent<T extends (...args: any[]) => void> {
    protected subscribers: Array<T> = [];

    public subscribe = (callback: T) => {
        this.subscribers.push(callback);
    };

    public unsubscribe = (callback: T) => {
        this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };

    public dispatch = (...args: Parameters<T>) => {
        if (isDev()) console.log('dispatch', this.name, ...args);
        this.subscribers.forEach((callback) => callback(...args));

        if (this.track) {
            posthog.capture(this.name, args);
        }
    };

    public constructor(private name: string, private track: boolean = false) {}
}

export const events = {
    sectionChange: new GameStateEvent<(player: number, previousSectionIndex: number) => void>('sectionChange'),
    // newPlayerNote: new GameStateEvent<(player: number, playerNote: PlayerNote) => void>('//', true),
    // playerNoteUpdate: new GameStateEvent<(player: number, playerNote: PlayerNote) => void>('//', true),

    songStarted: new GameStateEvent<(song: Song | SongPreview, singSetup: SingSetup) => void>('songStarted', true),
    songEnded: new GameStateEvent<
        (song: Song | SongPreview, singSetup: SingSetup, scores: Array<{ name: string; score: number }>) => void
    >('songEnded', true),

    phoneConnected: new GameStateEvent<(phone: { id: string; name: string }) => void>('phoneConnected', true),
    phoneDisconnected: new GameStateEvent<(phone: { id: string; name: string }) => void>('phoneDisconnected', true),
    playerInputChanged: new GameStateEvent<
        (playerNumber: number, oldInput: SelectedPlayerInput, newInput: SelectedPlayerInput) => void
    >('playerInputChanged', true),
    inputListChanged: new GameStateEvent<() => void>('inputListChanged'),

    karaokeConnectionStatusChange: new GameStateEvent<
        (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error') => void
    >('karaokeConnectionStatusChange', true),
    remoteMicPlayerNumberSet: new GameStateEvent<(playerNumber: number | null) => void>('remoteMicPlayerNumberSet'),
    remoteMicMonitoringStarted: new GameStateEvent('remoteMicMonitoringStarted'),
    remoteMicMonitoringStopped: new GameStateEvent('remoteMicMonitoringStopped'),

    micMonitoringStarted: new GameStateEvent('micMonitoringStarted'),
    micMonitoringStopped: new GameStateEvent('micMonitoringStopped'),

    songStatStored: new GameStateEvent<(key: string, stats: SongStats) => void>('songStatStored'),
};

export default events;
