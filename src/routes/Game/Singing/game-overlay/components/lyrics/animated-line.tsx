import { AnimatePresence, motion } from 'motion/react';
import { ComponentProps, ReactNode } from 'react';

const animatedLineBaseStyle = {
  textAlign: 'center' as const,
  position: 'absolute' as const,
  width: '100%',
};

type MotionDivProps = ComponentProps<typeof motion.div>;

type MotionInitial = MotionDivProps['initial'];

type MotionAnimate = MotionDivProps['animate'];

type MotionExit = MotionDivProps['exit'];

export default function AnimatedLine(props: {
  motionKey: string;
  effectsEnabled: boolean;
  initial: MotionInitial;
  animate: MotionAnimate;
  exit: MotionExit;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      <motion.div
        transition={props.effectsEnabled ? undefined : { duration: 0 }}
        key={props.motionKey}
        style={animatedLineBaseStyle}
        initial={props.initial}
        animate={props.animate}
        exit={props.exit}>
        {props.children}
      </motion.div>
    </AnimatePresence>
  );
}
