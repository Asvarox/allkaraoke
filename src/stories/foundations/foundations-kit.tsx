import { ComponentProps, ElementType, ReactNode, useEffect, useRef, useState } from 'react';

import { cn } from '~/utils/cn';

/**
 * Shared furniture for the Foundations pages.
 *
 * Everything here reads its value back out of the DOM rather than printing a number typed into the
 * story. A swatch labelled `text-active` shows whatever `text-active` actually resolves to in the
 * built stylesheet, so these pages cannot drift away from the tokens they document — if someone
 * changes a token, the page changes with it, and if someone deletes one the swatch goes blank.
 */

/** Reads one computed property off an element once it has rendered. */
function useComputed(ref: React.RefObject<HTMLElement | null>, property: string) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (ref.current) setValue(getComputedStyle(ref.current).getPropertyValue(property));
  }, [ref, property]);

  return value;
}

export function Page({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <div className="typography min-h-screen bg-slate-950 p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-active text-3xl font-bold">{title}</h1>
          <p className="max-w-3xl text-sm opacity-80">{intro}</p>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Section({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {note && <p className="max-w-3xl text-sm opacity-70">{note}</p>}
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

/** A labelled row: the name of the thing on the left, a live sample on the right. */
export function Row({ name, meta, children }: { name: string; meta?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="w-56 shrink-0">
        <code className="text-sm">{name}</code>
        {meta && <div className="text-xs opacity-60">{meta}</div>}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

interface SwatchProps extends ComponentProps<'div'> {
  /** Which computed property the caption should report — the one the swatch is demonstrating. */
  property?: 'background-color' | 'color' | 'border-color';
}

/** A colour chip that captions itself with its own computed value. */
export function Swatch({ property = 'background-color', className, style, ...props }: SwatchProps) {
  const ref = useRef<HTMLDivElement>(null);
  const value = useComputed(ref, property);

  return (
    <div className="flex items-center gap-3">
      <div
        {...props}
        ref={ref}
        // `cn`, not a template string: a swatch demonstrating `border-white/10` has to actually
        // override the default border here rather than losing to it in the cascade.
        className={cn('h-10 w-16 shrink-0 rounded-md border border-white/20', className)}
        style={style}
      />
      <code className="text-xs opacity-70">{value || '—'}</code>
    </div>
  );
}

/**
 * A text sample that captions itself with its own computed size or colour.
 *
 * `as` matters: the measurement has to happen on the element that carries the style. Wrapping an
 * `<h1>` in a span and measuring the span reports the span's inherited 16px, not the heading's own
 * size — so a heading renders as `as="h1"` and is measured directly.
 */
export function TextSample<T extends 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' = 'span'>({
  as,
  property,
  className,
  children,
}: {
  as?: T;
  property: 'font-size' | 'color' | 'font-weight';
  className?: string;
  children: ReactNode;
}) {
  const Component = (as ?? 'span') as ElementType;
  const ref = useRef<HTMLElement>(null);
  const value = useComputed(ref, property);

  return (
    <div className="flex items-baseline gap-4">
      <Component ref={ref} className={className}>
        {children}
      </Component>
      <code className="ml-auto shrink-0 text-xs opacity-60">{value || '—'}</code>
    </div>
  );
}

/**
 * A busy ground to put translucent surfaces on. The in-game surfaces are translucent black over
 * whatever the song video happens to be showing, so judging them against flat grey says nothing
 * about how they actually read.
 */
export function BusyGround({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('rounded-xl p-6', className)}
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, #1e3a8a 0 24px, #7c2d12 24px 48px, #14532d 48px 72px, #581c87 72px 96px)',
      }}>
      {children}
    </div>
  );
}
