import { PolymorphicProps } from 'modules/Elements/AKUI/types';
import { ElementType, ForwardedRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type Props<T extends ElementType> = PolymorphicProps<T> & {};

export default forwardRef(function Box<T extends ElementType = 'div'>(
  { as, className, children, ...props }: Props<T>,
  ref: ForwardedRef<any>,
) {
  const Component = as || 'div';
  return (
    <Component
      className={twMerge(`flex flex-col items-center bg-black/50 justify-center box-border rounded-md`, className)}
      {...props}
      ref={ref}>
      {children}
    </Component>
  );
});
