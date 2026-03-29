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
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, top: '20%' }}
            animate={{ opacity: 1, top: '0%' }}
            exit={{ opacity: 0, top: '20%' }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed left-0 z-20001 h-screen w-screen overflow-auto">
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
