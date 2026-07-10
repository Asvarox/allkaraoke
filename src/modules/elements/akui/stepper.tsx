import { Check } from '@mui/icons-material';
import { motion } from 'motion/react';
import { Fragment } from 'react';
import { cn } from '~/utils/cn';

interface Props {
  steps: string[];
  /** Index of the current step. */
  current: number;
}

/** Horizontal progress stepper shown above a menu box. */
export const Stepper = ({ steps, current }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
    transition={{ duration: 0.3 }}
    className="mb-4 flex items-center justify-center gap-3"
    data-test="stepper">
    {steps.map((step, index) => {
      const isDone = index < current;
      const isCurrent = index === current;
      return (
        <Fragment key={step}>
          {index > 0 && (
            <div
              className={cn(
                'h-0.5 w-10 rounded-full transition-colors duration-300',
                isDone || isCurrent ? 'bg-active' : 'bg-white/25',
              )}
            />
          )}
          <div className="flex items-center gap-2" data-test={`stepper-step-${index}`} data-current={isCurrent}>
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300',
                isCurrent && 'bg-active text-black',
                isDone && 'bg-active/40 text-white',
                !isCurrent && !isDone && 'bg-white/15 text-white/60',
              )}>
              {isDone ? <Check className="h-5 w-5" /> : index + 1}
            </span>
            <span
              className={cn(
                'typography text-sm transition-opacity duration-300',
                isCurrent ? 'opacity-100' : 'opacity-50',
              )}>
              {step}
            </span>
          </div>
        </Fragment>
      );
    })}
  </motion.div>
);
