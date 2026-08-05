import { LayoutGroup, motion } from 'motion/react';

import { Icon } from '~/modules/elements/akui/icon';

export interface WizardStepEntry {
  id: number;
  label: string;
}

interface Props {
  completedSteps: WizardStepEntry[];
  activeStep: WizardStepEntry;
}

const transition = { duration: 0.4, ease: 'easeOut' as const };

// Replaces a linear progress bar with a checklist: as each step finishes, its header morphs (via a
// shared layoutId) from the big active header into a green checked row above the next step's header.
// Shared by the remote-mic connection wizard and the online-room setup wizard so both read the same.
export default function WizardChecklist({ completedSteps, activeStep }: Props) {
  return (
    <LayoutGroup>
      <div className="flex flex-col gap-1.5">
        {completedSteps.map(({ id, label }) => (
          <motion.div
            key={id}
            layoutId={`wizard-step-${id}`}
            layout
            transition={transition}
            className="flex items-center gap-1.5 text-sm font-medium text-green-400">
            <Icon icon="ic:outline-check-circle" className="text-base" />
            <span>{label}</span>
          </motion.div>
        ))}
        <motion.div
          key={activeStep.id}
          layoutId={`wizard-step-${activeStep.id}`}
          layout
          transition={transition}
          className="text-active text-xl font-bold">
          {activeStep.label}
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
