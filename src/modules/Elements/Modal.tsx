import { AnimatePresence, motion } from 'motion/react';
import { PropsWithChildren } from 'react';
import { twc } from 'react-twc';
interface Props extends PropsWithChildren {
  open: boolean;
  onClose?: () => void;
}

export default function Modal({ children, open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClick={onClose} className="opacity-100 duration-300 starting:opacity-0" exit={{ opacity: 0 }} />
          <motion.div
            exit={{ opacity: 0, top: '20%' }}
            onClick={onClose}
            className="fixed top-0 left-0 z-20001 h-screen w-screen overflow-auto opacity-100 duration-300 starting:top-20 starting:opacity-0">
            <div className="flex min-h-full items-center justify-center">
              <div onClick={(e) => e.stopPropagation()}>{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const Backdrop = twc(
  motion.div,
)`fixed top-0 left-0 z-[20000] h-screen w-screen bg-black/75 [background-image:radial-gradient(transparent_3px,rgba(0,0,0,0.5)_3px)] [background-size:10px_10px] backdrop-blur-[20px]`;
