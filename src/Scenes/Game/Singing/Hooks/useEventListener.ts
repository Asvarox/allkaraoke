import { useEffect, useMemo, useState } from 'react';
import { GameStateEvent } from '../GameState/GameStateEvents';

export function useEventListener<T extends (...args: any[]) => void>(event: GameStateEvent<T>) {
    const [value, setValue] = useState<Parameters<T> | null>(null);

    useEffect(() => {
        const subscriber = ((...args: Parameters<T>) => {
            setValue(args);
            console.log(args);
        }) as T;
        event.subscribe(subscriber);
        return () => event.unsubscribe(subscriber);
    }, [event]);

    return value;
}

export function useEventListenerSelector<S extends any>(
    event: GameStateEvent<any> | GameStateEvent<any>[],
    selector: () => S,
) {
    const initialValueRef = useMemo(selector, []);
    const [value, setValue] = useState<S>(initialValueRef);

    const eventList = Array.isArray(event) ? event : [event];

    useEffect(() => {
        const subscriber = () => setValue(selector());
        eventList.forEach((e) => e.subscribe(subscriber));

        return () => eventList.forEach((e) => e.unsubscribe(subscriber));
    }, eventList);

    return value;
}
