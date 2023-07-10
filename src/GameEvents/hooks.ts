import { GameEvent } from 'GameEvents/GameEvents';
import { useEffect, useMemo, useState } from 'react';

export function useEventListener<T extends (...args: any[]) => void>(event: GameEvent<T>) {
    const [value, setValue] = useState<Parameters<T> | null>(null);

    useEffect(() => {
        const subscriber = ((...args: Parameters<T>) => {
            setValue(args);
        }) as T;
        event.subscribe(subscriber);
        return () => event.unsubscribe(subscriber);
    }, [event]);

    return value;
}

export function useEventEffect<T extends (...args: any[]) => void>(event: GameEvent<T> | GameEvent<T>[], effect: T) {
    const eventList = Array.isArray(event) ? event : [event];

    useEffect(() => {
        eventList.forEach((e) => e.subscribe(effect));

        return () => eventList.forEach((e) => e.unsubscribe(effect));
    }, [...eventList, effect]);
}

export function useEventListenerSelector<S extends any>(
    event: GameEvent<any> | GameEvent<any>[],
    selector: () => S,
    dependencies: any[] = [],
) {
    const initialValueRef = useMemo(selector, []);
    const [value, setValue] = useState<S>(initialValueRef);

    const eventList = Array.isArray(event) ? event : [event];

    useEffect(() => {
        setValue(selector());
    }, dependencies);

    useEffect(() => {
        const subscriber = () => setValue(selector());
        eventList.forEach((e) => e.subscribe(subscriber));

        return () => eventList.forEach((e) => e.unsubscribe(subscriber));
    }, [...eventList]);

    return value;
}
