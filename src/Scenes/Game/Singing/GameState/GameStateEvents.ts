import { SingSetup, Song, SongPreview } from 'interfaces';
import { SelectedPlayerInput } from 'Scenes/Game/Singing/Input/InputManager';

export class GameStateEvent<T extends (...args: any[]) => void> {
    protected subscribers: Array<T> = [];

    public subscribe = (callback: T) => {
        this.subscribers.push(callback);
    };

    public unsubscribe = (callback: T) => {
        this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };

    public dispatch = (...args: Parameters<T>) => {
        this.subscribers.forEach((callback) => callback(...args));
    };
}

export const events = {
    sectionChange: new GameStateEvent<(player: number, previousSectionIndex: number) => void>(),
    // newPlayerNote: new GameStateEvent<(player: number, playerNote: PlayerNote) => void>(),
    // playerNoteUpdate: new GameStateEvent<(player: number, playerNote: PlayerNote) => void>(),

    songStarted: new GameStateEvent<(song: Song | SongPreview, singSetup: SingSetup) => void>(),
    songEnded: new GameStateEvent<
        (song: Song | SongPreview, singSetup: SingSetup, scores: Array<{ name: string; score: number }>) => void
    >(),

    phoneConnected: new GameStateEvent<(phone: { id: string; name: string }) => void>(),
    phoneDisconnected: new GameStateEvent<(phone: { id: string; name: string }) => void>(),
    playerInputChanged: new GameStateEvent<
        (playerNumber: number, oldInput: SelectedPlayerInput, newInput: SelectedPlayerInput) => void
    >(),
    inputListChanged: new GameStateEvent<() => void>(),

    karaokeConnectionStatusChange: new GameStateEvent<
        (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error') => void
    >(),
    remoteMicPlayerNumberSet: new GameStateEvent<(playerNumber: number | null) => void>(),
    remoteMicMonitoringStarted: new GameStateEvent(),
    remoteMicMonitoringStopped: new GameStateEvent(),

    micMonitoringStarted: new GameStateEvent(),
    micMonitoringStopped: new GameStateEvent(),
};

export default events;
