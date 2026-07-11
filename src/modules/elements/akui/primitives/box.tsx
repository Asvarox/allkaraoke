import { ElementType } from 'react';
import { twMerge } from 'tailwind-merge';
import { PolymorphicProps } from '~/modules/elements/akui/types';

type Props<T extends ElementType> = PolymorphicProps<T>;

export default function Box<T extends ElementType = 'div'>({ as, className, children, ...props }: Props<T>) {
  const Component = as || 'div';
  return (
    <Component
      className={twMerge(
        `box-border flex flex-col items-center justify-center rounded-xl bg-black/30 shadow-[inset_0px_0px_40px_2px_rgba(0,0,0,0.2)]`,
        className,
      )}
      {...props}>
      {children}
    </Component>
  );
}
