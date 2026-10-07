import isMobile from 'is-mobile';

import { Menu } from '~/modules/elements/akui/menu';
import { useMicrophoneStatus } from '~/modules/user-media/hooks';
import isOpera from '~/modules/utils/is-opera';
import isWindows from '~/modules/utils/is-windows';

import allowBlockedVideo from './allow-blocked.avif';
import allowMicrophoneVideo from './allow-microphone.avif';
import mobileAllowMicrophoneVideo from './mobile-allow-microphone.avif';
import mobileMicBlockedVideo from './mobile-mic-blocked.avif';

// Where the OS keeps the per-app microphone switch - the site-level unblock video doesn't help there
const getSystemSettingsPath = () => {
  const userAgent = navigator?.userAgent ?? '';
  if (/Android/i.test(userAgent)) return 'Settings ➔ Apps ➔ (your browser, e.g. Chrome) ➔ Permissions ➔ Microphone';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'Settings ➔ (your browser, e.g. Chrome) ➔ Microphone';
  if (isWindows()) return 'Settings ➔ Privacy & security ➔ Microphone';
  if (/Mac/i.test(userAgent)) return 'System Settings ➔ Privacy & Security ➔ Microphone';
  return "your device's privacy settings";
};

interface Props {
  showImage?: boolean;
}

const MicAccessDeniedView = ({ showImage = true }: Props) => {
  const status = useMicrophoneStatus();
  const isMobileDevice = isMobile();

  if (status === 'blocked-by-system') {
    return (
      <div className="flex flex-col gap-2" data-test="mic-blocked-by-system">
        <span className="typography text-lg">Your browser itself has no access to the microphone</span>
        <Menu.HelpText>
          Allowing it on this page won&apos;t help until you enable it in <strong>{getSystemSettingsPath()}</strong>,
          then come back and try again.
        </Menu.HelpText>
      </div>
    );
  }

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
