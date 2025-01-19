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
      className={twMerge(`flex flex-col items-center bg-black/50 justify-center box-border rounded-md`, className)}
      {...props}
      ref={ref}>
      {children}
    </Component>
  );
}
