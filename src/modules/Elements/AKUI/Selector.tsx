import {
  Children,
  cloneElement,
  ComponentProps,
  createContext,
  isValidElement,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '~/modules/Elements/AKUI/Button';

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
// Hook: track scroll arrow visibility
// ---------------------------------------------------------------------------

function useScrollArrows(ref: React.RefObject<HTMLElement | null>) {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 1);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [ref, update]);

  return { showLeft, showRight };
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

// Register typed CSS custom properties once so the browser can transition them.
let maskPropsRegistered = false;
function ensureMaskPropsRegistered() {
  if (maskPropsRegistered) return;
  maskPropsRegistered = true;
  try {
    CSS.registerProperty({ name: '--sel-mask-left', syntax: '<length>', inherits: false, initialValue: '0px' });
    CSS.registerProperty({ name: '--sel-mask-right', syntax: '<length>', inherits: false, initialValue: '0px' });
  } catch {
    // Already registered or not supported — safe to ignore.
  }
}

// ---------------------------------------------------------------------------
// ScrollableRow — reusable scroll container with fade-mask + arrow indicators
// ---------------------------------------------------------------------------

export function ScrollableRow({ children, className }: PropsWithChildren<{ className?: string }>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showLeft, showRight } = useScrollArrows(scrollRef);

  useEffect(() => {
    ensureMaskPropsRegistered();
  }, []);

  return (
    <div className={twMerge('relative min-w-0 overflow-hidden', className)}>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-start pl-1 transition-opacity duration-150"
        style={{ opacity: showLeft ? 1 : 0 }}
        aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-end pr-1 transition-opacity duration-150"
        style={{ opacity: showRight ? 1 : 0 }}
        aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div
        ref={scrollRef}
        style={
          {
            '--sel-mask-left': showLeft ? '40px' : '0px',
            '--sel-mask-right': showRight ? '40px' : '0px',
            maskImage:
              'linear-gradient(to right, transparent, black var(--sel-mask-left), black calc(100% - var(--sel-mask-right)), transparent)',
            transition: '--sel-mask-left 100ms ease, --sel-mask-right 100ms ease',
          } as React.CSSProperties
        }
        className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}

function SelectorRoot({ value, onChange, children, asChild, className }: SelectorProps) {
  const ctx: SelectorContextValue = { value, onChange };

  if (asChild) {
    // Merge className into the single child element; context is still injected.
    const child = Children.only(children);
    const merged =
      isValidElement(child) && className
        ? cloneElement(child as React.ReactElement<{ className?: string }>, {
            className: twMerge((child.props as { className?: string }).className, className),
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
      ref.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [isActive]);

  return (
    <Button
      ref={ref}
      {...props}
      focused={isActive}
      onClick={() => ctx.onChange(value)}
      className={twMerge('scale-100!', className)}>
      {children}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const Selector = Object.assign(SelectorRoot, { Item: SelectorItem });
