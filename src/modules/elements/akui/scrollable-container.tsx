import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '~/utils/cn';

type Orientation = 'horizontal' | 'vertical';

/** How far the fade reaches in from an edge that has content scrolled past it. */
const DEFAULT_FADE_SIZE = 40;

// ---------------------------------------------------------------------------
// Hook: track which edges have content scrolled past them
// ---------------------------------------------------------------------------

/**
 * Whether the container is scrolled away from its start and/or end edge — the single source both the
 * arrows and the fade mask read, so they can never disagree about which edge cuts content off.
 *
 * The 1px slack absorbs sub-pixel scroll positions: a container scrolled all the way to the end can
 * land a fraction short of `scrollWidth`, which would otherwise leave the arrow up forever.
 */
function useScrollEdges(ref: React.RefObject<HTMLElement | null>, orientation: Orientation) {
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const [offset, client, scroll] =
      orientation === 'horizontal'
        ? [el.scrollLeft, el.clientWidth, el.scrollWidth]
        : [el.scrollTop, el.clientHeight, el.scrollHeight];
    setShowStart(offset > 1);
    setShowEnd(offset + client < scroll - 1);
  }, [ref, orientation]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    // Children arriving, leaving or resizing change what fits just as much as scrolling does — a
    // board that loads its rows a moment later would otherwise keep the mask it had while empty.
    const ro = new ResizeObserver(update);
    ro.observe(el);
    for (const child of el.children) ro.observe(child);
    const mo = new MutationObserver(() => {
      for (const child of el.children) ro.observe(child);
      update();
    });
    mo.observe(el, { childList: true });
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
      mo.disconnect();
    };
  }, [ref, update]);

  return { showStart, showEnd };
}

// ---------------------------------------------------------------------------
// Typed custom properties, so the mask can transition instead of snapping
// ---------------------------------------------------------------------------

let maskPropsRegistered = false;
function ensureMaskPropsRegistered() {
  if (maskPropsRegistered) return;
  maskPropsRegistered = true;
  try {
    CSS.registerProperty({ name: '--scroll-mask-start', syntax: '<length>', inherits: false, initialValue: '0px' });
    CSS.registerProperty({ name: '--scroll-mask-end', syntax: '<length>', inherits: false, initialValue: '0px' });
  } catch {
    // Already registered or not supported — safe to ignore.
  }
}

// ---------------------------------------------------------------------------
// Arrows
// ---------------------------------------------------------------------------

/** Chevron paths in a 16×16 box, one per edge of each orientation. */
const ARROW_PATHS: Record<Orientation, { start: string; end: string }> = {
  horizontal: { start: 'M10 3L5 8l5 5', end: 'M6 3l5 5-5 5' },
  vertical: { start: 'M3 10l5-5 5 5', end: 'M3 6l5 5 5-5' },
};

function Arrow({ orientation, edge, visible }: { orientation: Orientation; edge: 'start' | 'end'; visible: boolean }) {
  const position =
    orientation === 'horizontal'
      ? cn('inset-y-0 w-10 items-center', edge === 'start' ? 'left-0 justify-start pl-1' : 'right-0 justify-end pr-1')
      : cn('inset-x-0 h-10 justify-center', edge === 'start' ? 'top-0 items-start pt-1' : 'bottom-0 items-end pb-1');

  return (
    <div
      className={cn('pointer-events-none absolute z-10 flex transition-opacity duration-150', position)}
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d={ARROW_PATHS[orientation][edge]}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScrollableContainer
// ---------------------------------------------------------------------------

interface Props extends PropsWithChildren {
  /** Which way the content scrolls. Defaults to a row. */
  orientation?: Orientation;
  /** Classes for the wrapper — where a caller's own size, and so the scrollport's, belongs. */
  className?: string;
  /** Classes for the scrolling element itself, for the layout of the children inside it. */
  contentClassName?: string;
  /** Chevrons at the edges that have more content past them. */
  arrows?: boolean;
  /** How far the fade reaches in, in pixels. */
  fadeSize?: number;
  'data-test'?: string;
}

/**
 * A scrollport that says where the content continues: the edge it cuts through fades out, and a
 * chevron points that way. Both appear only on an edge with content scrolled past it, so a list that
 * fits entirely looks like a plain list.
 *
 * The fade is a mask rather than a gradient overlay because it has to work on any background — these
 * containers sit on screens, panels and the remote's own surface, and an overlay would need to know
 * which colour it is fading to.
 *
 * The scrollbar is hidden throughout: the fade and the chevrons are the affordance, and the native
 * bar would sit across the content on the platforms that draw one.
 */
export function ScrollableContainer({
  children,
  orientation = 'horizontal',
  className,
  contentClassName,
  arrows = true,
  fadeSize = DEFAULT_FADE_SIZE,
  'data-test': dataTest,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showStart, showEnd } = useScrollEdges(scrollRef, orientation);
  const isHorizontal = orientation === 'horizontal';

  useEffect(() => {
    ensureMaskPropsRegistered();
  }, []);

  return (
    <div className={cn('relative overflow-hidden', isHorizontal ? 'min-w-0' : 'min-h-0', className)}>
      {arrows && (
        <>
          <Arrow orientation={orientation} edge="start" visible={showStart} />
          <Arrow orientation={orientation} edge="end" visible={showEnd} />
        </>
      )}
      <div
        ref={scrollRef}
        data-test={dataTest}
        style={
          {
            '--scroll-mask-start': showStart ? `${fadeSize}px` : '0px',
            '--scroll-mask-end': showEnd ? `${fadeSize}px` : '0px',
            maskImage: `linear-gradient(to ${isHorizontal ? 'right' : 'bottom'}, transparent, black var(--scroll-mask-start), black calc(100% - var(--scroll-mask-end)), transparent)`,
            transition: '--scroll-mask-start 100ms ease, --scroll-mask-end 100ms ease',
          } as React.CSSProperties
        }
        className={cn(
          'flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          isHorizontal ? 'items-center gap-1 overflow-x-auto' : 'h-full flex-col overflow-y-auto',
          contentClassName,
        )}>
        {children}
      </div>
    </div>
  );
}

/** The row form — the shape most callers want, and the one {@link ScrollableContainer} defaults to. */
export function ScrollableRow(props: Omit<Props, 'orientation'>) {
  return <ScrollableContainer {...props} orientation="horizontal" />;
}

/** The column form: a list that fades and points at whichever of its ends holds more rows. */
export function ScrollableColumn(props: Omit<Props, 'orientation'>) {
  return <ScrollableContainer {...props} orientation="vertical" />;
}
