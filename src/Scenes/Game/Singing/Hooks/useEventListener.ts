import { useEffect, useState } from 'react';
import { GameStateEvent } from '../GameState/GameStateEvents';

export default function useEventListener<T extends (...args: any[]) => void>(event: GameStateEvent<T>) {
    const [value, setValue] = useState<Parameters<T> | null>(null);

    useEffect(() => {
        const subscriber = ((...args: Parameters<T>) => setValue(args)) as T;
        event.subscribe(subscriber);
        return () => event.unsubscribe(subscriber);
    }, [event]);

    return value;
}
