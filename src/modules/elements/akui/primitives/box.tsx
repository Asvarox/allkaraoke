import { ElementType } from 'react';

import { PolymorphicProps } from '~/modules/elements/akui/types';
import { cn } from '~/utils/cn';

type Props<T extends ElementType> = PolymorphicProps<T>;

export default function Box<T extends ElementType = 'div'>({ as, className, children, ...props }: Props<T>) {
  const Component = as || 'div';
  return (
    <Component
      className={cn(
        `box-border flex flex-col items-center justify-center rounded-xl bg-black/40 shadow-[inset_0px_0px_40px_2px_rgba(0,0,0,0.2)]`,
        className,
      )}
      {...props}>
      {children}
    </Component>
  );
}
