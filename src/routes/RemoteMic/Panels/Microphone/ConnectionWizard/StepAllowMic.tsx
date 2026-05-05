import { Icon } from '@iconify-icon/react';
import MicAccessDeniedView from '~/modules/UserMedia/MicAccessDeniedView';

// This step is only rendered when mic permission has been denied.
// The ConnectionWizard probes getUserMedia on mount — if accepted it skips
// this step entirely, so we only ever land here in the 'declined' state.

interface Props {
  onComplete: () => void;
}

const StepAllowMic = ({ onComplete: _onComplete }: Props) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2 text-center">
      <Icon icon="mdi:warning" className="text-active text-3xl" />
      <MicAccessDeniedView />
    </div>
  );
};

export default StepAllowMic;
