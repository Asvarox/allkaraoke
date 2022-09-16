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
    phoneConnected: new GameStateEvent<(id: string) => void>(),
    phoneDisconnected: new GameStateEvent<(id: string) => void>(),
    playerInputChanged: new GameStateEvent<(input: SelectedPlayerInput) => void>(),
    inputListChanged: new GameStateEvent<() => void>(),
};

export default events;
