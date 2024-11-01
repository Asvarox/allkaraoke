import { useEffect, useRef, type MutableRefObject } from 'react';

/**
 * a type-safe version of the `usePrevious` hook described here:
 * @see {@link https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state}
 */
export default function usePrevious<T>(value: T): MutableRefObject<T>['current'] {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  // eslint-disable-next-line react-compiler/react-compiler
  return ref.current;
}
