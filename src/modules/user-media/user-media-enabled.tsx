import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

import { Icon } from '~/modules/elements/akui/icon';
import { useMicrophoneStatus } from '~/modules/user-media/hooks';

import MicAccessDeniedView from './mic-access-denied-view';

interface Props extends PropsWithChildren {
  fallback: ReactNode;
  /**
   * Shown while the permission status is still resolving, in place of the nothing that would
   * otherwise be there for those few hundred ms. A screen whose children don't depend on the
   * permission being granted — one that starts out as placeholders anyway — can pass them here too,
   * so it opens as itself rather than as an empty panel that fills in.
   */
  pending?: ReactNode;
  showImages?: boolean;
}
const UserMediaEnabled = ({ children, fallback, pending = null, showImages = true }: Props) => {
  const status = useMicrophoneStatus();
  // Debounce the fallback: the permission status often resolves within a few hundred ms,
  // and flashing the "allow microphone access" info for a frame looks broken
  const [showFallback, setShowFallback] = useState(false);
  useEffect(() => {
    if (status === 'accepted') {
      setShowFallback(false);
      return;
    }
    const timeout = setTimeout(() => setShowFallback(true), 500);
    return () => clearTimeout(timeout);
  }, [status]);

  // One slot rather than three mutually exclusive ones: a screen that passes the same node as both
  // `pending` and `children` (see the prop) then keeps it mounted across the switch, instead of
  // having React tear it down and build the identical tree again in another position.
  if (status === 'accepted') return <>{children}</>;
  if (!showFallback) return <>{pending}</>;

  return (
    <>
      <div className="flex w-full justify-center">
        <Icon icon="mdi:warning" className="text-active text-3xl" />
      </div>
      {fallback}
      <div className="flex w-full flex-col items-center justify-center">
        <MicAccessDeniedView showImage={showImages} />
      </div>
    </>
  );
};
export default UserMediaEnabled;
