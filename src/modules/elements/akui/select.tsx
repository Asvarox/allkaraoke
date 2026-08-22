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

import Box from '~/modules/elements/akui/primitives/box';
import { Input } from '~/modules/elements/input';
import { nextIndex } from '~/modules/utils/indexes';
import scrollIntoView from '~/modules/utils/scroll-into-view';

export interface SelectOption {
  value: string;
  label: string;
  /**
   * Rendered twice, so it should size itself to its container (`h-full w-full object-cover`): as a
   * small square in the option list, and as a strip covering the right edge of the closed field.
   */
  icon?: ReactNode;
}

interface Props extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'label'> {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
  $keyboardNavigationChangeFocus?: (direction: -1 | 1) => void;
  className?: string;
}

/**
 * Searchable select with a locked value — unlike {@link Autocomplete}, which is free text over
 * `string[]`, the committed value always comes from `options`. Typing filters, Enter commits the
 * highlighted option, Escape reverts to whatever was committed before the search started.
 */
export const Select = ({
  options,
  value,
  onChange,
  label,
  focused,
  disabled,
  placeholder,
  $keyboardNavigationChangeFocus,
  className,
  ref,
  ...restProps
}: Props) => {
  const inputRef = useRef<ComponentRef<typeof Input>>(null);
  useImperativeHandle(ref, () => inputRef.current!);

  const optionsMenu = useRef<HTMLDivElement>(null);

  // Opens on focus, not on mount: mounted-open covers whatever sits below the field before the
  // player has touched anything.
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusedOption, setFocusedOption] = useState(-1);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return options;

    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const close = () => {
    setIsOpen(false);
    setQuery('');
    setFocusedOption(-1);
  };

  const commit = (option: SelectOption) => {
    onChange(option.value);
    close();
    inputRef.current?.element?.blur();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      if (filteredOptions.length) {
        e.preventDefault();
        setIsOpen(true);
        const newIndex = nextIndex(filteredOptions, focusedOption, e.code === 'ArrowUp' ? -1 : 1);
        setFocusedOption(newIndex);

        scrollIntoView(optionsMenu.current?.querySelector(`[data-index="${newIndex}"]`) as HTMLDivElement, {
          block: 'center',
        });
      } else {
        inputRef.current?.element?.blur();
        $keyboardNavigationChangeFocus?.(e.code === 'ArrowUp' ? -1 : 1);
      }
    } else if (e.code === 'Enter') {
      e.preventDefault();
      // A single remaining match is unambiguous, so Enter takes it without arrowing to it first
      const option = filteredOptions[focusedOption] ?? (filteredOptions.length === 1 ? filteredOptions[0] : undefined);

      if (option) {
        commit(option);
      } else {
        close();
        inputRef.current?.element?.blur();
      }
    } else if (e.code === 'Escape') {
      e.preventDefault();
      close();
      inputRef.current?.element?.blur();
    }
  };

  return (
    <Container className={className}>
      <Input
        {...restProps}
        // `w-full` matches the trigger's width to its container so the options box (also `w-full`)
        // lines up with it; the icon strip needs the value clear of it
        className={!isOpen && value && selectedOption?.icon ? 'w-full [&_input]:pr-20' : 'w-full'}
        role="combobox"
        aria-expanded={isOpen}
        ref={inputRef}
        focused={focused}
        label={label}
        disabled={disabled}
        placeholder={placeholder}
        // The selected option's icon covers the right edge of the field, the way the language rows
        // on the Select Song Languages screen carry their flag. An empty committed value (e.g. "Prefer
        // not to say") shows the placeholder instead, so no icon strip either.
        adornment={!isOpen && value && selectedOption?.icon && <SelectedIcon>{selectedOption.icon}</SelectedIcon>}
        // While open the field holds the search query; closed, it mirrors the committed option, unless
        // the committed value is empty - then the placeholder shows through
        value={isOpen ? query : value && (selectedOption?.label ?? '')}
        onChange={(newQuery) => {
          setIsOpen(true);
          setQuery(newQuery);
          setFocusedOption(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(close, 300)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && !!filteredOptions.length && (
        <SelectMenu ref={optionsMenu} role="listbox">
          {filteredOptions.map((option, index) => (
            <SelectMenuItem
              role="listitem"
              key={option.value}
              data-index={index}
              data-focused={index === focusedOption}
              data-e2e-focused={index === focusedOption}
              data-e2e-selected={option.value === value}
              $focused={index === focusedOption}
              onClick={() => commit(option)}>
              {option.icon && <OptionIcon>{option.icon}</OptionIcon>}
              <span className="truncate">{option.label}</span>
            </SelectMenuItem>
          ))}
        </SelectMenu>
      )}
    </Container>
  );
};

Select.displayName = 'Select';

const Container = twc.div`relative`;

// Matches the flag strip on the language rows: inset by the border, full height, rounded to the
// field's own corner. The aspect ratio keeps the proportion at any field height.
const SelectedIcon = twc.span`pointer-events-none absolute top-[1px] right-[1px] bottom-[1px] aspect-3/2 overflow-hidden rounded-r-xl`;

const OptionIcon = twc.span`h-[1em] w-[1.5em] shrink-0 overflow-hidden rounded-xs`;

// `justify-start` undoes `Box`'s `justify-center`: a centred flex column that overflows pushes its
// leading items past the scroll origin, where no amount of scrolling can reach them.
// `bg-slate-800` + border is the same surface a modal `Menu` is made of, so the popup reads as part
// of the app. `Box`'s own `bg-black/30` disappears against a dark backdrop once the list overflows
// past whatever it is anchored in.
const SelectMenu = twc(
  Box,
)`absolute z-2 max-h-[12em] w-full items-stretch justify-start gap-3 overflow-y-auto border border-white/10 bg-slate-800 p-1`;

// `text-lg` (with the same `mobile:text-md` breakpoint) matches the committed value's size in the
// trigger, which sits in an `Input` at the default `small` size.
const SelectMenuItem = twc.div<{ $focused: boolean } & TwcComponentProps<'div'>>((props) => [
  'typography mobile:text-md flex cursor-pointer min-h-[1em] max-h-[1em] items-center gap-2 overflow-hidden rounded-lg p-2 text-lg whitespace-nowrap',
  props.$focused ? 'text-active' : 'text-white',
]);

interface TestWrapperProps {
  label: string;
  options: SelectOption[];
  focused: boolean;
  initialValue?: string;
}

export const SelectTestWrapper = ({ label, options, focused, initialValue = '' }: TestWrapperProps) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div>
      <Select value={value} onChange={setValue} label={label} options={options} focused={focused} />
      <span data-test="committed-value">{value}</span>
    </div>
  );
};
