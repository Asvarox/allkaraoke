import { Warning } from '@mui/icons-material';
import { PropsWithChildren, ReactNode } from 'react';
import { Menu } from '~/modules/Elements/AKUI/Menu';
import { useMicrophoneStatus } from '~/modules/UserMedia/hooks';
import isOpera from '~/modules/utils/isOpera';
import allowMic from './allow-mic.png';
import enableMicOpera from './enable-mic-opera.png';
import enableMic from './enable-mic.png';

const getProperEnableMicImage = () => (isOpera() ? enableMicOpera : enableMic);

interface Props extends PropsWithChildren {
  fallback: ReactNode;
  showImages?: boolean;
}
const UserMediaEnabled = ({ children, fallback, showImages = true }: Props) => {
  const status = useMicrophoneStatus();

  const imageClassName = 'box-border max-w-full rounded-2xl border-8 border-white shadow-lg mt-6 mb-2';

  return (
    <>
      {status === 'accepted' && children}
      {status !== 'accepted' && (
        <>
          <div className="flex w-full justify-center">
            <Warning className="text-active text-3xl" />
          </div>
          {fallback}
          <div className="text-center">
            {status === 'requested' && showImages && (
              <img className={imageClassName} src={allowMic} alt="how-to-allow" />
            )}
            {status === 'declined' && (
              <>
                <span className="typography text-lg">Access is blocked, you can unblock it here</span>
                {showImages && <img className={imageClassName} src={getProperEnableMicImage()} alt="how-to-enable" />}
              </>
            )}
            {isOpera() && (
              <Menu.HelpText className="text-lg">
                <strong>Opera</strong> is buggy regarding microphone access - if you encounter issue (e.g. this message
                stays even after the access to microphone was granted), consider other browsers.
              </Menu.HelpText>
            )}
          </div>
        </>
      )}
    </>
  );
};
export default UserMediaEnabled;
