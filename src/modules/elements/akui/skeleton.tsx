import { ComponentProps } from 'react';

import { cn } from '~/utils/cn';

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div aria-hidden="true" className={cn('rounded-md bg-white/12 motion-safe:animate-pulse', className)} {...props} />
  );
}
