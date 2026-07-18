import { Icon } from '@iconify-icon/react';

import { MenuButton } from '~/modules/elements/menu';
import MicAccessDeniedView from '~/modules/user-media/mic-access-denied-view';
import userMediaService from '~/modules/user-media/user-media-service';

// This step is only rendered when mic permission has been denied.
// The ConnectionWizard probes getUserMedia on mount — if accepted it skips
// this step entirely, so we only ever land here in the 'declined' state.

interface Props {
  onComplete: () => void;
}

const StepAllowMic = ({ onComplete }: Props) => {
  const handleRetry = () => {
    // Re-probe mic permission — if the user has since allowed it, advance to the next step
    userMediaService
      .getUserMedia({ audio: true })
      .then(onComplete)
      .catch(() => {
        // Still denied — stay on this step
      });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2 text-center">
      <Icon icon="mdi:warning" className="text-active text-3xl" />
      <MicAccessDeniedView />
      <MenuButton onClick={handleRetry}>Retry</MenuButton>
    </div>
  );
};

export default StepAllowMic;
