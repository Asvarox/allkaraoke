import { GameEvent } from 'modules/GameEvents/GameEvents';
import { useEffect, useMemo, useState } from 'react';

export function useEventListener<T extends (...args: any[]) => void>(event: GameEvent<T>, getLast = false) {
  const [value, setValue] = useState<Parameters<T> | null>(null);

  useEffect(() => {
    const subscriber = ((...args: Parameters<T>) => {
      setValue(args);
    }) as T;
    event.subscribe(subscriber, getLast);
    return () => event.unsubscribe(subscriber);
  }, [event]);

  return value;
}

type AnyFunc = (...args: any[]) => void;
export function useEventEffect<T1 extends AnyFunc, T2 extends AnyFunc>(
  events: [GameEvent<T1>, GameEvent<T2>],
  effect: T1 | T2,
  dependencies?: any[],
): void;
export function useEventEffect<T1 extends AnyFunc, T2 extends AnyFunc, T3 extends AnyFunc>(
  events: [GameEvent<T1>, GameEvent<T2>, GameEvent<T3>],
  effect: T1 | T2 | T3,
  dependencies?: any[],
): void;
export function useEventEffect<T1 extends AnyFunc>(events: GameEvent<T1>, effect: T1, dependencies?: any[]): void;
export function useEventEffect<T extends AnyFunc>(
  event: GameEvent<T> | GameEvent<T>[],
  effect: T,
  dependencies: any[] = [],
) {
  const eventList = Array.isArray(event) ? event : [event];

  useEffect(() => {
    eventList.forEach((e) => e.subscribe(effect));

    return () => eventList.forEach((e) => e.unsubscribe(effect));
  }, [...eventList, effect, ...dependencies]);
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
