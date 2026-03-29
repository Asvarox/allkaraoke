import { AnimatePresence, motion } from 'motion/react';
import { PropsWithChildren, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { twc } from 'react-twc';

export interface BottomSheetProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
  /** Optional title rendered above the content area */
  title?: ReactNode;
}

const Backdrop = twc(motion.div)`fixed inset-0 z-19999 bg-black/60 backdrop-blur-sm`;

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const sheet = (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 bottom-0 left-0 z-20000 rounded-t-2xl bg-black/95"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-white/30" />
            </div>
            {title && (
              <div className="px-4 pb-2 text-sm font-bold tracking-widest text-white/50 uppercase">{title}</div>
            )}
            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto px-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(sheet, document.body);
}
