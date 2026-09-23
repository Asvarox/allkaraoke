import { AnimatePresence, motion } from 'motion/react';
import {
  ComponentProps,
  createContext,
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactNode,
  useContext,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Button, ButtonBase, ButtonSize } from '~/modules/elements/akui/button';
import useResponsiveValue from '~/modules/elements/akui/hooks/use-responsive-value';
import { Icon, IconName } from '~/modules/elements/akui/icon';
import { InputWrapper } from '~/modules/elements/akui/input-wrapper';
import { ResponsiveValue } from '~/modules/elements/akui/types';
import { REGULAR_ALPHA_CHARS } from '~/modules/hooks/use-keyboard';
import { cn } from '~/utils/cn';
import { twx } from '~/utils/twx';

/**
 * A field is a line of text, not a target to aim at across a room — the two taller Button sizes
 * would make it one, so it only comes in the two short ones.
 */
type InputSize = Extract<ButtonSize, 'mini' | 'small'>;

/**
 * The size of the field an adornment sits in, so a control placed inside it can size itself instead
 * of every call site repeating the field's own size in a second place.
 */
const InputSizeContext = createContext<InputSize>('small');

/**
 * Icons *inside* the field run a step smaller than the ones a Button of the same size carries: they
 * sit next to text at the field's own font size rather than filling an icon gutter.
 */
const sizeToAdornmentIconSize = {
  mini: 4,
  small: 5,
} satisfies Record<InputSize, number>;

/**
 * A button inside a field runs one size below the field itself, so it reads as something the field
 * contains rather than a second control of equal weight stacked on top of it.
 */
const sizeToInnerButtonSize = {
  mini: 'mini',
  small: 'mini',
} satisfies Record<InputSize, ButtonSize>;

interface InputRef {
  element: HTMLInputElement | null;
  triggerValidationError: (message: string) => void;
}
interface Props extends Omit<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
  'onChange' | 'ref' | 'size'
> {
  focused: boolean;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  adornment?: ReactNode;
  info?: ReactNode;
  size?: ResponsiveValue<InputSize>;
  ref?: React.Ref<InputRef>;
}

export const Input = ({
  focused,
  label,
  value,
  onChange,
  disabled,
  readOnly,
  className,
  adornment,
  info,
  ref,
  size = 'small',
  ...restProps
}: Props) => {
  const [validationError, setValidationError] = useState<null | string>(null);
  const validationErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resolvedSize = useResponsiveValue(size);
  const inputId = useId();
  useImperativeHandle(ref, () => ({
    element: inputRef.current,
    triggerValidationError: (message: string) => {
      if (validationErrorTimeoutRef.current) {
        clearTimeout(validationErrorTimeoutRef.current);
      }
      setValidationError(message);
      validationErrorTimeoutRef.current = setTimeout(() => {
        setValidationError(null);
      }, 4000);
    },
  }));

  // Read-only is disabled that still has something to say: the value stays legible instead of
  // greying out, but the field is as inert as a disabled one — no caret, no hover, no typing.
  const inert = Boolean(disabled) || Boolean(readOnly);

  useHotkeys(REGULAR_ALPHA_CHARS, () => inputRef.current?.focus(), {
    enabled: focused && !inert,
  });

  return (
    <InputWrapper info={info}>
      {/* The field is built from the button *surface*, not from a button: it holds an `<input>`, and
          its adornment holds controls of its own (`Input.IconButton`, `Input.Button`) — neither is
          allowed inside a `<button>`. It's a plain box that passes a click on its padding down to
          the input, the way the field's own label does. */}
      <ButtonBase
        as="div"
        data-size={resolvedSize}
        data-focused={focused}
        data-subtle-focus
        data-disabled={disabled}
        data-read-only={readOnly}
        className={cn(
          `relative scale-100!`,
          inert ? 'cursor-default' : 'cursor-text',
          className,
          validationError ? 'starting:outline-danger/0 outline-danger/100 outline outline-offset-2 duration-300' : '',
        )}
        onClick={() => {
          if (!inert) inputRef.current?.focus();
        }}>
        <Label htmlFor={inputId}>{label}</Label>
        <StyledInput
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...restProps}
          disabled={disabled}
          readOnly={readOnly}
          // Disabled greys the value along with the box it sits in, the way a disabled Button greys
          // its label; read-only keeps the value in full colour — it is there to be read.
          className={cn(inert && 'cursor-default caret-transparent', disabled && 'text-gray-300!')}
          ref={inputRef}
        />
        {adornment && (
          <InputSizeContext.Provider value={resolvedSize}>
            <Adornment>{adornment}</Adornment>
          </InputSizeContext.Provider>
        )}
        <AnimatePresence>
          {validationError && (
            <motion.div
              exit={{ opacity: 0, right: '20%' }}
              className="bg-danger/75 text-default absolute right-0 bottom-[-1.5rem] rounded-md p-1 text-sm opacity-100 duration-300 starting:right-10 starting:opacity-0">
              {validationError}️
            </motion.div>
          )}
        </AnimatePresence>
      </ButtonBase>
    </InputWrapper>
  );
};

/**
 * Presses inside the field must not blur it: a blur is what hands the keyboard back to the screen
 * behind the field, so the control would be acting on a field the navigation had already left.
 * Mousedown's default is swallowed and the click that follows it still fires — which is also what
 * keyboard activation sends, so the control keeps working without a mouse.
 */
const keepFieldFocused =
  (onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void) =>
  (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onMouseDown?.(event);
  };

interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: IconName;
  /** Overrides the size the field hands down. */
  size?: ResponsiveValue<number>;
}

/**
 * The bare icon control a field grows at its trailing edge — clear, close, send. No surface of its
 * own: it reads as part of the field rather than as a button parked on top of it, and it takes its
 * icon size from the field it sits in.
 */
const InputIconButton = ({ icon, size, className, onMouseDown, ...props }: IconButtonProps) => {
  const fieldSize = useContext(InputSizeContext);
  return (
    <button
      type="button"
      onMouseDown={keepFieldFocused(onMouseDown)}
      className={cn(
        'text-default flex cursor-pointer items-center duration-300 disabled:cursor-default disabled:text-gray-400',
        className,
      )}
      {...props}>
      <Icon icon={icon} size={size ?? sizeToAdornmentIconSize[fieldSize]} />
    </button>
  );
};

/**
 * A labelled button inside the field — "Apply", "Join", anything an icon alone can't say. It always
 * wears the active fill: it is the one thing in the field that does something on its own, and on a
 * field that is itself a dark box, the resting surface would disappear into it.
 */
const InputButton = ({ className, onMouseDown, ...props }: Omit<ComponentProps<typeof Button>, 'size'>) => {
  const fieldSize = useContext(InputSizeContext);

  return (
    <Button
      size={sizeToInnerButtonSize[fieldSize]}
      type="button"
      onMouseDown={keepFieldFocused(onMouseDown)}
      // An even 8px inset: stretched to the field's height less `my-2`, and `-mr-1` trims the
      // field's 12px right padding to 8px. The radius steps down to match the inset, so the
      // button's corners run parallel to the field's instead of bulging towards them.
      className={cn(
        'my-2 -mr-1 h-auto shrink-0 self-stretch rounded-lg text-sm',
        // The active fill is the resting state here, but a disabled button still has to read as
        // disabled — `bg-active!` would otherwise win over the grey it gets from `ButtonBase`.
        !props.disabled && 'bg-active! text-shadow-legible',
        className,
      )}
      {...props}
    />
  );
};

Input.IconButton = InputIconButton;
Input.Button = InputButton;

// Full height, so a button in it (`Input.Button`) can stretch to the field's height.
const Adornment = twx.span`flex shrink-0 items-center gap-1 self-stretch`;

// Not bold: the label names the field, the value is what the field is for — same split the
// switcher's label and value carry.
const Label = twx.label`pointer-events-none inline-flex w-auto items-center justify-center font-normal whitespace-nowrap [&_svg]:text-[1em]`;

const StyledInput = twx.input`typography text-active w-full border-0 bg-transparent p-0 text-[1em] [caret-shape:underscore] focus:outline-none`;
