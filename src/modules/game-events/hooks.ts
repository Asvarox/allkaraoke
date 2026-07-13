import { useEffect, useState } from 'react';
import { GameEvent } from '~/modules/game-events/game-events';

export function useEventListener<T extends (...args: any[]) => void>(event: GameEvent<T>, getLast = false) {
  const [value, setValue] = useState<Parameters<T> | null>(null);

  useEffect(() => {
    const subscriber = ((...args: Parameters<T>) => {
      setValue(args);
    }) as T;
    event.subscribe(subscriber, getLast);
    return () => event.unsubscribe(subscriber);
  }, [event, getLast]);

  return value;
}

type AnyFunc = (...args: any[]) => void;
export function useEventEffect<T1 extends AnyFunc, T2 extends AnyFunc>(
  events: [GameEvent<T1>, GameEvent<T2>],
  effect: T1 | T2,
  dependencies?: unknown[],
): void;
export function useEventEffect<T1 extends AnyFunc, T2 extends AnyFunc, T3 extends AnyFunc>(
  events: [GameEvent<T1>, GameEvent<T2>, GameEvent<T3>],
  effect: T1 | T2 | T3,
  dependencies?: unknown[],
): void;
export function useEventEffect<T1 extends AnyFunc>(events: GameEvent<T1>, effect: T1, dependencies?: unknown[]): void;
export function useEventEffect<T extends AnyFunc>(
  event: GameEvent<T> | GameEvent<T>[],
  effect: T,
  dependencies: unknown[] = [],
) {
  const eventList = Array.isArray(event) ? event : [event];

  useEffect(() => {
    eventList.forEach((e) => e.subscribe(effect));

    return () => eventList.forEach((e) => e.unsubscribe(effect));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- generic hook: deps are composed from the caller-provided event(s) and `dependencies` and can't be statically verified
  }, [...eventList, effect, ...dependencies]);
}

export function useEventListenerSelector<S>(
  event: GameEvent<any> | GameEvent<any>[],
  selector: () => S,
  dependencies: unknown[] = [],
) {
  const [value, setValue] = useState<S>(selector);

  const eventList = Array.isArray(event) ? event : [event];

  /* eslint-disable react-hooks/exhaustive-deps -- generic hook: re-runs on the caller-provided `dependencies` (not a static array literal) */
  useEffect(() => {
    setValue(selector());
  }, dependencies);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    const subscriber = () => setValue(selector());
    eventList.forEach((e) => e.subscribe(subscriber));

    return () => eventList.forEach((e) => e.unsubscribe(subscriber));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- (re)subscribes only when the event list changes; `selector` is intentionally read latest
  }, [...eventList]);

  return value;
}
