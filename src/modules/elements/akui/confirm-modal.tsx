import { ComponentProps, ReactNode } from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import Modal from '~/modules/elements/modal';

type MenuButtonProps = Omit<ComponentProps<typeof Menu.Button>, 'children' | 'size'>;

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description: ReactNode;
  cancelLabel: ReactNode;
  confirmLabel: ReactNode;
  dataTestPrefix?: string;
  cancelButtonProps?: MenuButtonProps;
  confirmButtonProps?: MenuButtonProps;
}

export default function ConfirmModal({
  open,
  onClose,
  title,
  description,
  cancelLabel,
  confirmLabel,
  dataTestPrefix,
  cancelButtonProps,
  confirmButtonProps,
}: ConfirmModalProps) {
  return (
    // A confirmation is always the thing on top: it's routinely opened from inside another modal (the
    // online pause menu ends the game this way), and at the base layer that modal's content would
    // cover this one's backdrop.
    <Modal onClose={onClose} open={open} withPortal level="nested">
      {open && (
        <Menu spacing="tight" data-test={dataTestPrefix ? `${dataTestPrefix}-modal` : undefined}>
          <Menu.Header>{title}</Menu.Header>
          <Menu.HelpText>{description}</Menu.HelpText>
          <Menu.ButtonGroup className="flex-col gap-2 sm:flex-row">
            <Menu.Button {...cancelButtonProps} size="small">
              {cancelLabel}
            </Menu.Button>
            <Menu.Button {...confirmButtonProps} size="small">
              {confirmLabel}
            </Menu.Button>
          </Menu.ButtonGroup>
        </Menu>
      )}
    </Modal>
  );
}
