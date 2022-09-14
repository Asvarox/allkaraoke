import { useEffect, useState } from 'react';
import { GameStateEvent } from '../GameState/GameStateEvents';

export function useEventListener<T extends (...args: any[]) => void>(event: GameStateEvent<T>) {
    const [value, setValue] = useState<Parameters<T> | null>(null);

    useEffect(() => {
        const subscriber = ((...args: Parameters<T>) => setValue(args)) as T;
        event.subscribe(subscriber);
        return () => event.unsubscribe(subscriber);
    }, [event]);

    return value;
}

export function useEventListenerSelector<S extends any>(event: GameStateEvent<any>, selector: () => S) {
    const [value, setValue] = useState<S>(selector());

    useEffect(() => {
        const subscriber = () => setValue(selector());
        event.subscribe(() => {
            subscriber();
        });
        return () => event.unsubscribe(subscriber);
    }, [event]);

    return value;
}
