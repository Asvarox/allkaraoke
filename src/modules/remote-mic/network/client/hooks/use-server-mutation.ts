import { useCallback, useRef, useState } from 'react';

/** Returns a stable mutate function with loading/error state for a one-off server call. */
export function useServerMutation<TArgs extends any[], TReturn = void>(
  mutationFn: (...args: TArgs) => Promise<TReturn>,
): { mutate: (...args: TArgs) => Promise<TReturn>; loading: boolean; error: Error | null } {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutationFnRef = useRef(mutationFn);
  mutationFnRef.current = mutationFn;

  const mutate = useCallback((...args: TArgs): Promise<TReturn> => {
    setLoading(true);
    setError(null);
    return mutationFnRef
      .current(...args)
      .then((result) => {
        setLoading(false);
        return result;
      })
      .catch((err) => {
        const wrappedError = err instanceof Error ? err : new Error(String(err));
        setError(wrappedError);
        setLoading(false);
        throw wrappedError;
      });
    // mutate is intentionally stable; the mutation function is accessed via ref to avoid stale closures
  }, []);

  return { mutate, loading, error };
}
