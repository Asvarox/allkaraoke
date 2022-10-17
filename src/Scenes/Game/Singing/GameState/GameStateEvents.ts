import { SingSetup, Song, SongPreview } from 'interfaces';
import { SelectedPlayerInput } from 'Scenes/Game/Singing/Input/InputManager';
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
    };

    public constructor(private name: string) {}
}

export const events = {
    sectionChange: new GameStateEvent<(player: number, previousSectionIndex: number) => void>('sectionChange'),
    // newPlayerNote: new GameStateEvent<(player: number, playerNote: PlayerNote) => void>('//'),
    // playerNoteUpdate: new GameStateEvent<(player: number, playerNote: PlayerNote) => void>('//'),

    songStarted: new GameStateEvent<(song: Song | SongPreview, singSetup: SingSetup) => void>('songStarted'),
    songEnded: new GameStateEvent<
        (song: Song | SongPreview, singSetup: SingSetup, scores: Array<{ name: string; score: number }>) => void
    >('songEnded'),

    phoneConnected: new GameStateEvent<(phone: { id: string; name: string }) => void>('phoneConnected'),
    phoneDisconnected: new GameStateEvent<(phone: { id: string; name: string }) => void>('phoneDisconnected'),
    playerInputChanged: new GameStateEvent<
        (playerNumber: number, oldInput: SelectedPlayerInput, newInput: SelectedPlayerInput) => void
    >('playerInputChanged'),
    inputListChanged: new GameStateEvent<() => void>('inputListChanged'),

    karaokeConnectionStatusChange: new GameStateEvent<
        (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error') => void
    >('karaokeConnectionStatusChange'),
    remoteMicPlayerNumberSet: new GameStateEvent<(playerNumber: number | null) => void>('remoteMicPlayerNumberSet'),
    remoteMicMonitoringStarted: new GameStateEvent('remoteMicMonitoringStarted'),
    remoteMicMonitoringStopped: new GameStateEvent('remoteMicMonitoringStopped'),

    micMonitoringStarted: new GameStateEvent('micMonitoringStarted'),
    micMonitoringStopped: new GameStateEvent('micMonitoringStopped'),
};

export default events;
