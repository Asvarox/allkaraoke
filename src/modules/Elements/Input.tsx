import { REGULAR_ALPHA_CHARS } from 'modules/hooks/useKeyboard';
import { AnimatePresence, motion } from 'motion/react';
import {
  ComponentProps,
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { twc } from 'react-twc';
import { cn } from 'utils/cn';
import { Menu } from './AKUI/Menu';

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
  size?: ComponentProps<typeof Menu.Button>['size'];
  ref?: React.Ref<InputRef>;
}

export const Input = ({
  focused,
  label,
  value,
  onChange,
  disabled,
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

  useHotkeys(REGULAR_ALPHA_CHARS, () => inputRef.current?.focus(), { enabled: focused });

  return (
    <Menu.Button
      type="button"
      size={size}
      info={info}
      subtleFocused
      data-focused={focused}
      className={cn(
        `relative scale-100!`,
        className,
        validationError
          ? 'starting:outline-text-error/0 outline-text-error/100 outline outline-offset-2 duration-300'
          : '',
      )}
      onClick={() => {
        inputRef.current?.focus();
      }}>
      <Label>{label}</Label>
      <StyledInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...restProps}
        disabled={disabled}
        ref={inputRef}
      />
      {adornment && <Adornment>{adornment}</Adornment>}
      <AnimatePresence>
        {validationError && (
          <motion.div
            exit={{ opacity: 0, right: '20%' }}
            className="bg-text-error/75 absolute right-0 bottom-[-1.5rem] rounded-md p-1 text-sm text-white opacity-100 duration-300 starting:right-10 starting:opacity-0">
            {validationError}️
          </motion.div>
        )}
      </AnimatePresence>
    </Menu.Button>
  );
};

const Adornment = twc.span``;

const Label = twc.span`
  inline-flex items-center justify-center whitespace-nowrap w-auto pointer-events-none
  [&_svg]:text-[1em]
`;

const StyledInput = twc.input`
  p-0 border-0 bg-transparent [caret-shape:underscore]
  typography text-active w-full text-[1em]
  focus:outline-none
`;
