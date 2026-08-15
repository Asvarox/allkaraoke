import {
  ComponentProps,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useState,
} from 'react';

import { Menu } from '~/modules/elements/akui/menu';
import Modal from '~/modules/elements/modal';
import useKeyboardNav, { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';

interface ConfirmModalContextValue {
  /** The modal's own keyboard nav — the two buttons are the only things it navigates. */
  register: RegisterFunc;
  confirm: () => void;
  cancel: () => void;
}

const ConfirmModalContext = createContext<ConfirmModalContextValue | null>(null);

function useConfirmModalContext(component: string) {
  const context = useContext(ConfirmModalContext);
  if (!context) throw new Error(`<ConfirmModal.${component}> must be rendered inside <ConfirmModal>`);
  return context;
}

type ConfirmModalButtonProps = Omit<ComponentProps<typeof Menu.Button>, 'children' | 'size' | 'onClick'> & {
  /** Keyboard-nav registration name; also the button's `data-test`. */
  name: string;
  children: ReactNode;
  /** Which of the two the keyboard starts on. Cancel by default — the harmless one. */
  isDefault?: boolean;
};

/** The label mirrored to remote mics, when the button's content is plain text. */
const labelOf = (children: ReactNode) => (typeof children === 'string' ? children : undefined);

function CancelButton({ name, children, isDefault = true, ...props }: ConfirmModalButtonProps) {
  const { register, cancel } = useConfirmModalContext('CancelButton');
  const label = labelOf(children);

  return (
    <Menu.Button
      {...props}
      {...register(name, cancel, label, isDefault, {
        control: { type: 'button', label: label ?? 'Cancel', variant: 'back' },
      })}
      size="small">
      {children}
    </Menu.Button>
  );
}

function ConfirmButton({ name, children, isDefault = false, ...props }: ConfirmModalButtonProps) {
  const { register, confirm } = useConfirmModalContext('ConfirmButton');
  const label = labelOf(children);

  return (
    <Menu.Button
      {...props}
      {...register(name, confirm, label, isDefault, {
        // Forward arrow (the default) reads as "proceed", matching the other "move on" buttons.
        control: { type: 'button', label: label ?? 'Confirm' },
      })}
      size="small">
      {children}
    </Menu.Button>
  );
}

/** What the trigger child needs to expose for the modal to hook into it. */
interface TriggerProps {
  onClick?: (event: ReactMouseEvent) => void;
}

interface ConfirmModalProps {
  title: ReactNode;
  description: ReactNode;
  /** `<ConfirmModal.CancelButton>` / `<ConfirmModal.ConfirmButton>` — they wire themselves up. */
  cancelButton: ReactNode;
  confirmButton: ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  /**
   * The single element that opens the modal: it gets an `onClick` injected (composed with its own).
   * As a function it receives the opener instead — for triggers whose action has to be handed to
   * `useKeyboardNav`, since Enter and remote taps fire the registered callback rather than a DOM
   * click, and an injected `onClick` would never see them.
   */
  children?: ReactElement<TriggerProps> | ((open: () => void) => ReactNode);
  /** Controlled mode, for flows that don't start with a click on one element. */
  open?: boolean;
  /** Reports the open state out. Not needed to pause the screen underneath — see `exclusive` below. */
  onOpenChange?: (open: boolean) => void;
  dataTestPrefix?: string;
}

function ConfirmModalRoot({
  title,
  description,
  cancelButton,
  confirmButton,
  onConfirm,
  onCancel,
  children,
  open,
  onOpenChange,
  dataTestPrefix,
}: ConfirmModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const cancel = () => {
    setOpen(false);
    onCancel?.();
  };

  const confirm = () => {
    setOpen(false);
    onConfirm();
  };

  // The confirmation owns the keyboard while it's up: `exclusive` pauses every other navigation on
  // screen, so nothing underneath has to know this opened. Horizontal, the two buttons sit side by side.
  const { register } = useKeyboardNav({
    enabled: isOpen,
    exclusive: true,
    onBackspace: cancel,
    direction: 'horizontal',
    title: typeof title === 'string' ? title : undefined,
  });

  const trigger =
    typeof children === 'function'
      ? children(() => setOpen(true))
      : isValidElement<TriggerProps>(children)
        ? cloneElement(children, {
            onClick: (event: ReactMouseEvent) => {
              children.props.onClick?.(event);
              setOpen(true);
            },
          })
        : children;

  return (
    <>
      {trigger}
      {/* A confirmation is always the thing on top: it's routinely opened from inside another modal (the
          online pause menu ends the game this way), and at the base layer that modal's content would
          cover this one's backdrop. */}
      <Modal onClose={cancel} open={isOpen} withPortal level="nested">
        {isOpen && (
          <ConfirmModalContext value={{ register, confirm, cancel }}>
            <Menu spacing="tight" data-test={dataTestPrefix ? `${dataTestPrefix}-modal` : undefined}>
              <Menu.Header>{title}</Menu.Header>
              <Menu.HelpText>{description}</Menu.HelpText>
              <Menu.ButtonGroup className="flex-col gap-2 sm:flex-row">
                {cancelButton}
                {confirmButton}
              </Menu.ButtonGroup>
            </Menu>
          </ConfirmModalContext>
        )}
      </Modal>
    </>
  );
}

const ConfirmModal = Object.assign(ConfirmModalRoot, { CancelButton, ConfirmButton });

export default ConfirmModal;
