import { ElementType } from 'react';
import { twMerge } from 'tailwind-merge';
import { PolymorphicProps } from '~/modules/Elements/AKUI/types';

type Props<T extends ElementType> = PolymorphicProps<T>;

export default function Box<T extends ElementType = 'div'>({ as, className, children, ...props }: Props<T>) {
  const Component = as || 'div';
  return (
    <Component
      className={twMerge(`box-border flex flex-col items-center justify-center rounded-md bg-black/50`, className)}
      {...props}>
      {children}
    </Component>
  );
}
