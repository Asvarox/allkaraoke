import { AnimatePresence, motion } from 'motion/react';
import { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

import { Backdrop } from '~/modules/elements/akui/backdrop';
import { Button } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
import { ModalCloseButtonContext } from '~/modules/elements/modal-context';
import { cn } from '~/utils/cn';

interface Props extends PropsWithChildren {
  open: boolean;
  onClose?: () => void;
  // When true, renders the modal inside a React portal attached to document.body,
  // which ensures it escapes any parent stacking contexts or overflow:hidden containers.
  withPortal?: boolean;
  /**
   * Which rung of the stacking ladder this modal claims. `nested` is for a modal opened *from*
   * another modal (a confirmation over a pause menu): a portal alone doesn't help there, because the
   * modal underneath sits on `modal` and would render on top of a second `modal-backdrop` — leaving
   * the confirmation looking like it has no background at all.
   */
  level?: 'base' | 'nested';
  /** On a phone, fill the screen with a close button in the corner. Off for small prompts that read
   * better as a dialog over what they're about. */
  fullScreenOnPhone?: boolean;
}

const LEVELS = {
  base: { backdrop: 'z-modal-backdrop', content: 'z-modal' },
  nested: { backdrop: 'z-modal-top-backdrop', content: 'z-modal-top' },
} as const;

export default function Modal({
  children,
  open,
  onClose,
  withPortal = false,
  level = 'base',
  fullScreenOnPhone = true,
}: Props) {
  const layer = LEVELS[level];
  const closeButton = fullScreenOnPhone && !!onClose;
  const content = (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className={layer.backdrop}
          />
          <motion.div
            initial={{ opacity: 0, top: '20%' }}
            animate={{ opacity: 1, top: '0%' }}
            exit={{ opacity: 0, top: '20%' }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className={`fixed left-0 h-screen w-screen overflow-auto ${layer.content}`}>
            {/* On a phone the dialog takes the whole screen, its own surface stretched edge to edge */}
            <div
              className={cn(
                'flex min-h-full items-center justify-center',
                fullScreenOnPhone && 'phone:h-full phone:items-stretch',
              )}>
              <div
                className={cn(
                  fullScreenOnPhone &&
                    'phone:flex phone:size-full phone:flex-col phone:*:min-h-0 phone:*:w-full phone:*:max-w-none! phone:*:flex-1 phone:*:overflow-y-auto phone:*:rounded-none! phone:*:border-0 phone:*:max-h-none!',
                )}
                onClick={(e) => e.stopPropagation()}>
                <ModalCloseButtonContext value={closeButton}>{children}</ModalCloseButtonContext>
              </div>
            </div>
            {closeButton && (
              <Button
                size="mini"
                type="button"
                aria-label="Close"
                data-test="modal-close"
                className="phone:flex absolute top-2 right-2 hidden animate-none"
                leftIcon={<Icon icon="ic:baseline-close" />}
                fullWidth={false}
                onClick={onClose}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return withPortal ? createPortal(content, document.body) : content;
}
