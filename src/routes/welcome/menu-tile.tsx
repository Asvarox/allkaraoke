import { ComponentProps, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { NavButton } from '~/modules/elements/nav-controls';

// `variant` is taken over from `NavButton` (where it marks a control's role on the remote, e.g.
// `back`): no tile is ever anything but a plain forward action, so the name is free to describe the
// two sizes the menu grid actually has.
type Props = Omit<ComponentProps<typeof NavButton>, 'children' | 'size' | 'variant'> & {
  /** Also the label mirrored to the remote mic, so it has to stay a plain string. */
  label: string;
  /** One line under the label saying what the tile leads to. Never shown on the remote. */
  hint: string;
  /** `Badge`-style overlay pinned to the tile's corner, e.g. the "Preview" flag on Sing Online. */
  badge?: ReactNode;
  /** `primary` is the top row (Sing a song / Sing online); `secondary` is the smaller row below. */
  variant?: 'primary' | 'secondary';
};

/**
 * One tile of the main menu grid. Unlike a `Menu.Button` — which is a full-width row in a stack and
 * sizes itself — a tile fills whatever grid cell it is dropped into, so every size class here is
 * about the *text*; the box comes from the grid.
 */
function MenuTile({ label, hint, badge, variant = 'secondary', className, ...props }: Props) {
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
      className={twMerge(
        "mobile:min-h-16 h-full min-h-20 items-start! justify-start! px-4 py-3 text-left sm:px-6 sm:py-5 [&[data-focused='true']_[data-hint]]:text-black/60",
        className,
      )}>
      <span className="flex w-full min-w-0 flex-col items-start gap-1 sm:gap-2">
        <span className={twMerge('w-full leading-tight text-balance', primary ? 'text-lg sm:text-xl' : 'text-md')}>
          {label}
        </span>
        <span
          data-hint
          className={twMerge(
            'mobile:hidden w-full truncate font-normal tracking-widest normal-case opacity-70',
            primary ? 'text-sm' : 'text-xs',
          )}>
          {hint}
        </span>
      </span>
      {badge}
    </NavButton>
  );
}

export default MenuTile;
