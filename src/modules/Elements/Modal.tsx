import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'motion/react';
import { PropsWithChildren } from 'react';
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

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.75);
  background-size: 10px 10px;
  width: 100vw;
  height: 100vh;
  z-index: 20000;
  backdrop-filter: blur(20px);
  background-image: radial-gradient(transparent 3px, rgb(0, 0, 0, 0.5) 3px);
`;
