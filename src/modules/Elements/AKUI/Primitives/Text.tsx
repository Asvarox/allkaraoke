import { PolymorphicProps } from 'modules/Elements/AKUI/types';
import { ElementType } from 'react';
import { twMerge } from 'tailwind-merge';

type Props<T extends ElementType> = PolymorphicProps<T> & {
  active?: boolean;
};

export default function Text<T extends ElementType = 'span'>({ as, className, children, active, ...props }: Props<T>) {
  const Component = as || 'span';
  return (
    <Component
      className={twMerge(
        `typography [&_a]:typography text-base [&_a]:text-active ${active ? 'text-active' : ''}`,
        className,
      )}
      {...props}>
      {children}
    </Component>
  );
}
