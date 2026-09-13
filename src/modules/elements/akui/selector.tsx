import {
  Children,
  cloneElement,
  ComponentProps,
  createContext,
  isValidElement,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from 'react';

import { Button } from '~/modules/elements/akui/button';
import { ScrollableRow } from '~/modules/elements/akui/scrollable-container';
import scrollIntoView from '~/modules/utils/scroll-into-view';
import { cn } from '~/utils/cn';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SelectorContextValue {
  value: string;
  onChange: (value: string) => void;
}

const SelectorContext = createContext<SelectorContextValue | null>(null);

function useSelectorContext(): SelectorContextValue {
  const ctx = useContext(SelectorContext);
  if (!ctx) throw new Error('Selector.Item must be used inside a Selector');
  return ctx;
}

// ---------------------------------------------------------------------------
// Selector (root / wrapper)
// ---------------------------------------------------------------------------

interface SelectorProps extends PropsWithChildren {
  value: string;
  onChange: (value: string) => void;
  /**
   * When true, the Selector renders no wrapper element of its own — it instead
   * clones its single child and merges the Selector's own className into it
   * (Radix-style composition). The context is still provided.
   */
  asChild?: boolean;
  className?: string;
}

function SelectorRoot({ value, onChange, children, asChild, className }: SelectorProps) {
  const ctx: SelectorContextValue = { value, onChange };

  if (asChild) {
    // Merge className into the single child element; context is still injected.
    const child = Children.only(children);
    const merged =
      isValidElement(child) && className
        ? cloneElement(child as React.ReactElement<{ className?: string }>, {
            className: cn((child.props as { className?: string }).className, className),
          })
        : child;

    return <SelectorContext.Provider value={ctx}>{merged}</SelectorContext.Provider>;
  }

  return (
    <SelectorContext.Provider value={ctx}>
      <ScrollableRow className={className}>{children}</ScrollableRow>
    </SelectorContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Selector.Item
// ---------------------------------------------------------------------------

type SelectorItemProps = Omit<ComponentProps<typeof Button>, 'focused' | 'onClick'> & {
  value: string;
};

function SelectorItem({ value, children, className, ...props }: SelectorItemProps) {
  const ctx = useSelectorContext();
  const isActive = ctx.value === value;
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      scrollIntoView(ref.current, { inline: 'center', block: 'nearest' });
    }
  }, [isActive]);

  return (
    <Button
      ref={ref}
      {...props}
      focused={isActive}
      onClick={() => ctx.onChange(value)}
      className={cn('scale-100!', className)}>
      {children}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const Selector = Object.assign(SelectorRoot, { Item: SelectorItem });
