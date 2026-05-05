import { Icon } from '@iconify-icon/react';
import { PropsWithChildren, ReactNode } from 'react';
import { useMicrophoneStatus } from '~/modules/UserMedia/hooks';
import MicAccessDeniedView from './MicAccessDeniedView';

interface Props extends PropsWithChildren {
  fallback: ReactNode;
  showImages?: boolean;
}
const UserMediaEnabled = ({ children, fallback, showImages = true }: Props) => {
  const status = useMicrophoneStatus();

  return (
    <>
      {status === 'accepted' && children}
      {status !== 'accepted' && (
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
