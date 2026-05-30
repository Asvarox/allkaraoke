import { HTMLProps, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Kbd component for displaying keyboard keys with consistent styling.
 * Sizes itself relative to the parent's font-size using em units.
 */
export const Kbd = ({ className, children, ...props }: HTMLProps<HTMLElement>): ReactNode => {
  return (
    <kbd
      className={twMerge(
        'inline-block rounded-xl border-4 border-gray-300 border-r-gray-400 border-b-gray-400',
        'bg-gray-50 px-2 py-0.5 leading-snug font-normal text-gray-800',
        'shadow',
        className,
      )}
      {...props}>
      {children}
    </kbd>
  );
};
