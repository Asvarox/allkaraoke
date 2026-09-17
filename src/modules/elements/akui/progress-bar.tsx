import { ReactNode } from 'react';

import { Typography } from '~/modules/elements/akui/primitives/typography';
import { cn } from '~/utils/cn';

interface Props {
  /** How full the bar is, 0–1. Values outside the range are clamped rather than overflowing. */
  progress: number;
  /** Fill colour. Any CSS colour — bars are often tinted per player, which no class can cover.
   * Defaults to the active accent. */
  color?: string;
  /** Shown under the bar, on the left. Without it the bar renders on its own, with no label row. */
  label?: ReactNode;
  /** Shown under the bar, on the right. Defaults to `progress` as a whole percentage. */
  value?: ReactNode;
  /** Sizes the track. The default suits a label underneath; pass a taller one to use it alone. */
  barClassName?: string;
  className?: string;
  'data-test'?: string;
}

/**
 * A horizontal fill with an optional label row beneath it.
 *
 * The fill is deliberately **not** transitioned. Callers drive `progress` themselves, and the ones
 * that animate it do so frame by frame — easing it a second time here would leave the bar trailing
 * whatever number is printed next to it.
 */
export function ProgressBar({ progress, color, label, value, barClassName, className, 'data-test': dataTest }: Props) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));

  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', className)} data-test={dataTest}>
      <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/10 2xl:h-2', barClassName)}>
        <div
          className={cn('h-full rounded-full', color ? '' : 'bg-active')}
          style={{ width: `${clamped * 100}%`, backgroundColor: color }}
        />
      </div>
      {label !== undefined && (
        <Typography as="div" className="text-inactive flex justify-between gap-1 text-xs 2xl:text-sm">
          <span className="truncate">{label}</span>
          <span className="text-default font-semibold">{value ?? `${Math.round(clamped * 100)}%`}</span>
        </Typography>
      )}
    </div>
  );
}
