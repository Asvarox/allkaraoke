import { ComponentProps, ReactNode } from 'react';

import { NavButton } from '~/modules/elements/nav-controls';
import { cn } from '~/utils/cn';

// `variant` is taken over from `NavButton` (where it marks a control's role on the remote, e.g.
// `back`): no tile is ever anything but a plain forward action, so the name is free to describe the
// two sizes the menu grid actually has.
type Props = Omit<ComponentProps<typeof NavButton>, 'children' | 'size' | 'variant'> & {
  /** Also the label mirrored to the remote mic, so it has to stay a plain string. */
  label: string;
  displayLabel?: ReactNode;
  /** One line under the label saying what the tile leads to. Never shown on the remote. */
  hint: string;
  /** `primary` is the top row (Sing a song / Sing online); `secondary` is the smaller row below. */
  variant?: 'primary' | 'secondary';
};

/**
 * One tile of the main menu grid. Unlike a `Menu.Button` — which is a full-width row in a stack and
 * sizes itself — a tile fills whatever grid cell it is dropped into, so every size class here is
 * about the *text*; the box comes from the grid.
 */
function MenuTile({ label, hint, displayLabel, variant = 'secondary', className, ...props }: Props) {
  const primary = variant === 'primary';

  return (
    <NavButton
      {...props}
      remoteLabel={label}
      size={primary ? 'large' : 'regular'}
      // `h-full` beats the fixed height that comes with the akui size, `justify-start` undoes its
      // centring — the tile's label sits in its top-left corner, not in the middle of the box. The
      // `[data-focused]` rule re-colours the hint: focus turns the whole tile orange, and a dimmed
      // white line on that is unreadable.
      className={cn(
        "h-full min-h-20 items-start! justify-start! px-4 py-3 text-left max-lg:min-h-16 sm:px-6 sm:py-6 [&[data-focused='true']_[data-hint]]:text-black/60",
        className,
      )}>
      <span className="flex w-full min-w-0 flex-col items-start gap-1 sm:gap-2">
        <span className={cn('w-full leading-tight text-balance', primary ? 'text-lg sm:text-xl' : 'text-lg')}>
          {displayLabel || label}
        </span>
        <span
          data-hint
          className={cn(
            'w-full truncate font-normal tracking-widest normal-case max-lg:hidden',
            primary ? 'text-sm' : 'text-xs',
          )}>
          {hint}
        </span>
      </span>
    </NavButton>
  );
}

export default MenuTile;
