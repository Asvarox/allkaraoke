import { PolymorphicProps } from 'modules/Elements/AKUI/types';
import { ElementType, ForwardedRef } from 'react';
import { twMerge } from 'tailwind-merge';

type Props<T extends ElementType> = PolymorphicProps<T> & {
  ref?: ForwardedRef<any>;
};

export default function Box<T extends ElementType = 'div'>({ as, className, children, ref, ...props }: Props<T>) {
  const Component = as || 'div';
  return (
    <Component
      className={twMerge(`box-border flex flex-col items-center justify-center rounded-md bg-black/50`, className)}
      {...props}
      ref={ref}>
      {children}
    </Component>
  );
}
