import { PropsWithChildren } from 'react';

import { cn } from '~/utils/cn';

/** Whole class names, as Tailwind only sees literal ones. */
const fixedHeightFrom = { lg: 'lg:h-dvh', xl: 'xl:h-dvh' } as const;

interface Props extends PropsWithChildren {
  /** The width from which the screen is pinned to the viewport; below it, it grows past the fold. */
  fixedFrom?: keyof typeof fixedHeightFrom;
}

/** The frame of the full-screen pages (main menu, landing page, online lobby): padding and gaps
 * that step up with the width. */
export default function PageFrame({ fixedFrom, children }: Props) {
  return (
    <div
      className={cn(
        'flex min-h-dvh w-screen flex-col gap-3 p-3 lg:gap-4 lg:p-4 xl:gap-6 xl:p-6',
        fixedFrom && fixedHeightFrom[fixedFrom],
      )}>
      {children}
    </div>
  );
}
