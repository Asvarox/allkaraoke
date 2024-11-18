import { PolymorphicProps } from 'modules/Elements/AKUI/types';
import { ElementType, ForwardedRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type Props<T extends ElementType> = PolymorphicProps<T> & {
  active?: boolean;
};

export default forwardRef(function Text<T extends ElementType = 'span'>(
  { as, className, children, active, ...props }: Props<T>,
  ref: ForwardedRef<any>,
) {
  const Component = as || 'span';
  return (
    <Component
      className={twMerge(
        `typography text-base [&_a]:text-active [&_a]:typography ${active ? 'text-active' : ''}`,
        className,
      )}
      {...props}
      ref={ref}>
      {children}
    </Component>
  );
});
