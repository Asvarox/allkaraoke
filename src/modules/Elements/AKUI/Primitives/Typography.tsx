import { PolymorphicProps } from 'modules/Elements/AKUI/types';
import { ElementType } from 'react';
import { twMerge } from 'tailwind-merge';

type Props<T extends ElementType> = PolymorphicProps<T> & {
  active?: boolean;
};

export function Typography<T extends ElementType = 'span'>({ as, className, children, active, ...props }: Props<T>) {
  const Component = as || 'span';
  return (
    <Component
      className={twMerge(
        `typography [&_a]:typography [&_a]:text-active text-base ${active ? 'text-active' : ''}`,
        className,
      )}
      {...props}>
      {children}
    </Component>
  );
}
export default Typography;
