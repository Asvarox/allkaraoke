import { useEffect, useRef, useState } from 'react';
import events from '~/modules/GameEvents/GameEvents';
import { useEventListener } from '~/modules/GameEvents/hooks';

/** Runs a server query on mount and on reconnect, exposing data/loading/error state and a manual refetch. */
export function useServerQuery<T>(
  queryFn: () => Promise<T>,
  deps: unknown[] = [],
): { data: T | undefined; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const connectionStatus = useEventListener(events.karaokeConnectionStatusChange, true);
  const isConnected = connectionStatus?.[0] === 'connected';

  const refetch = () => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    queryFnRef
      .current()
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isConnected) return;
    let active = true;
    setLoading(true);
    setError(null);
    queryFnRef
      .current()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // queryFnRef is a stable ref and intentionally omitted from deps
  }, [isConnected, ...deps]);

  return { data, loading, error, refetch };
}
