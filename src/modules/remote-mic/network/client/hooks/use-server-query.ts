import { useEffect, useRef, useState } from 'react';

import events from '~/modules/game-events/game-events';
import { useEventListener } from '~/modules/game-events/hooks';

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

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const connectionStatus = useEventListener(events.karaokeConnectionStatusChange, true);
  const isConnected = connectionStatus?.[0] === 'connected';

  const refetch = () => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    queryFnRef
      .current()
      .then((result) => {
        if (mountedRef.current) setData(result);
      })
      .catch((err) => {
        if (mountedRef.current) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryFnRef is a stable ref and intentionally omitted; `deps` is a caller-provided passthrough
  }, [isConnected, ...deps]);

  return { data, loading, error, refetch };
}
