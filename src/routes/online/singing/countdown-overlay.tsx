import { AnimatePresence, motion } from 'motion/react';
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
      const remaining = OnlineClient.serverTimeToLocal(endsAtServerTime) - Date.now();
      setRemainingMs(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [endsAtServerTime]);

  // Fades in with the screen it arrives on and out into the first note, so neither end is a cut
  return (
    <AnimatePresence>
      {remainingMs > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/70"
          data-test="online-countdown">
          <span className="typography text-center text-6xl leading-tight md:text-8xl">
            {label}{' '}
            <span className="text-active [font-variant-numeric:tabular-nums]" data-test="online-countdown-number">
              {Math.ceil(remainingMs / 1_000)}
            </span>{' '}
            sec
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CountdownOverlay;
