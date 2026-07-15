import isMobile from 'is-mobile';

import { Menu } from '~/modules/elements/akui/menu';
import { useMicrophoneStatus } from '~/modules/user-media/hooks';
import isOpera from '~/modules/utils/is-opera';

import allowBlockedVideo from './allow-blocked.avif';
import allowMicrophoneVideo from './allow-microphone.avif';
import mobileAllowMicrophoneVideo from './mobile-allow-microphone.avif';
import mobileMicBlockedVideo from './mobile-mic-blocked.avif';

interface Props {
  showImage?: boolean;
}

const MicAccessDeniedView = ({ showImage = true }: Props) => {
  const status = useMicrophoneStatus();
  const isMobileDevice = isMobile();

  const video =
    status === 'requested'
      ? isMobileDevice
        ? mobileAllowMicrophoneVideo
        : allowMicrophoneVideo
      : isMobileDevice
        ? mobileMicBlockedVideo
        : allowBlockedVideo;

  return (
    <>
      {status === 'declined' && <span className="typography text-lg">Access is blocked, you can unblock it here</span>}
      {showImage && (
        <img
          className={'mt-6 mb-2 box-border rounded-2xl border-8 border-white shadow-lg'}
          src={video}
          alt="how-to-allow-or-unblock-mic"
        />
      )}
      {isOpera() && (
        <Menu.HelpText className="text-lg">
          <strong>Opera</strong> is buggy regarding microphone access - if you encounter issue (e.g. this message stays
          even after the access to microphone was granted), consider other browsers.
        </Menu.HelpText>
      )}
    </>
  );
};

export default MicAccessDeniedView;
