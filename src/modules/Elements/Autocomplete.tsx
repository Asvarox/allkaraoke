import { Input } from 'modules/Elements/Input';
import { nextIndex } from 'modules/Elements/Utils/indexes';
import {
  ComponentProps,
  ComponentRef,
  KeyboardEventHandler,
  ReactNode,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { twc, TwcComponentProps } from 'react-twc';

interface Props extends ComponentProps<typeof Input> {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  options: string[];
  placeholder?: string;
  $keyboardNavigationChangeFocus?: (direction: -1 | 1) => void;
  onBlur?: () => void;
  className?: string;
}

export const Autocomplete = ({
  options,
  focused,
  label,
  value,
  onChange,
  disabled,
  placeholder,
  $keyboardNavigationChangeFocus,
  onBlur,
  className,
  ref,
  ...restProps
}: Props) => {
  const inputRef = useRef<ComponentRef<typeof Input>>(null);
  useImperativeHandle(ref, () => inputRef.current!);

  const autocompleteMenu = useRef<HTMLDivElement>(null);

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [focusedOption, setFocusedOption] = useState(-1);

  const filteredOptions = useMemo(
    () =>
      options.filter((option) => option.toLowerCase().trim().includes(value.toLowerCase().trim()) && option !== value),
    [options, value],
  );

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      if (filteredOptions.length) {
        e.preventDefault();
        const newIndex = nextIndex(filteredOptions, focusedOption, e.code === 'ArrowUp' ? -1 : 1);
        setFocusedOption(newIndex);

        const option = autocompleteMenu.current?.querySelector(`[data-index="${newIndex}"]`) as HTMLDivElement;

        option?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        inputRef.current?.element?.blur();
        $keyboardNavigationChangeFocus?.(e.code === 'ArrowUp' ? -1 : 1);
      }
    } else if (e.code === 'Enter') {
      const option = filteredOptions[focusedOption];
      if (option) {
        setFocusedOption(-1);
        onChange(option);
      } else {
        inputRef.current?.element?.blur();
      }
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsInputFocused(false);
      onBlur?.();
    }, 300);
  };

  return (
    <Container className={className}>
      <Input
        onFocus={() => setIsInputFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onChange={onChange}
        value={value}
        focused={focused}
        label={label}
        disabled={disabled}
        ref={inputRef}
        placeholder={placeholder}
        {...restProps}
      />
      {isInputFocused && !!filteredOptions.length && (
        <AutocompleteMenu ref={autocompleteMenu} role="listbox">
          {filteredOptions.map((option, index) => (
            <AutocompleteMenuitem
              role="listitem"
              data-index={index}
              data-focused={index === focusedOption}
              data-e2e-focused={index === focusedOption}
              key={option}
              $focused={index === focusedOption}
              onClick={() => {
                onChange(option);
                setFocusedOption(-1);
                inputRef.current?.element?.blur();
              }}>
              {option}
            </AutocompleteMenuitem>
          ))}
        </AutocompleteMenu>
      )}
    </Container>
  );
};

Autocomplete.displayName = 'Autocomplete';

const Container = twc.div`relative`;

const AutocompleteMenu = twc.div`absolute z-2 mt-[0.1em] max-h-[6.4em] w-full overflow-y-auto bg-black`;

const AutocompleteMenuitem = twc.div<{ $focused: boolean } & TwcComponentProps<'div'>>((props) => [
  'typography cursor-pointer truncate overflow-hidden p-[0.3em] whitespace-nowrap',
  props.$focused ? 'text-active' : 'text-white',
]);

interface TestWrapperProps {
  label: string;
  options: string[];
  focused: boolean;
}

export const AutocompleteTestWrapper = ({ label, options, focused }: TestWrapperProps) => {
  const [value, setValue] = useState('');
  return <Autocomplete value={value} onChange={setValue} label={label} options={options} focused={focused} />;
};
