import { Icon } from '@iconify-icon/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { useMicrophoneStatus } from '~/modules/user-media/hooks';
import MicAccessDeniedView from './mic-access-denied-view';

interface Props extends PropsWithChildren {
  fallback: ReactNode;
  showImages?: boolean;
}
const UserMediaEnabled = ({ children, fallback, showImages = true }: Props) => {
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

  return (
    <>
      {status === 'accepted' && children}
      {status !== 'accepted' && showFallback && (
        <>
          <div className="flex w-full justify-center">
            <Icon icon="mdi:warning" className="text-active text-3xl" />
          </div>
          {fallback}
          <div className="flex w-full flex-col items-center justify-center">
            <MicAccessDeniedView showImage={showImages} />
          </div>
        </>
      )}
    </>
  );
};
export default UserMediaEnabled;
