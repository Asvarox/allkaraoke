import { useEffect, useState } from 'react';
import OnlineClient from '~/modules/online/client/online-client';

interface Props {
  endsAtServerTime: number;
  /** e.g. "Starting in" / "Resuming in" — rendered as `{label} X sec`. */
  label?: string;
}

/** Synchronized countdown driven by a server timestamp (converted to the local clock). */
function CountdownOverlay({ endsAtServerTime, label = 'Starting in' }: Props) {
  const [remainingMs, setRemainingMs] = useState(() => OnlineClient.serverTimeToLocal(endsAtServerTime) - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(OnlineClient.serverTimeToLocal(endsAtServerTime) - Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, [endsAtServerTime]);

  if (remainingMs <= 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/70"
      data-test="online-countdown">
      <span className="typography text-center text-6xl leading-tight md:text-8xl">
        {label}{' '}
        <span className="text-active [font-variant-numeric:tabular-nums]" data-test="online-countdown-number">
          {Math.ceil(remainingMs / 1_000)}
        </span>{' '}
        sec
      </span>
    </div>
  );
}

export default CountdownOverlay;
