import { ElementType } from 'react';

import { PolymorphicProps } from '~/modules/elements/akui/types';
import { cn } from '~/utils/cn';

type Props<T extends ElementType> = PolymorphicProps<T> & {
  active?: boolean;
};

export function Typography<T extends ElementType = 'span'>({ as, className, children, active, ...props }: Props<T>) {
  const Component = as || 'span';
  return (
    <Component
      className={cn(
        `typography [&_a]:typography [&_a]:text-active text-base ${active ? 'text-active' : ''}`,
        className,
      )}
      {...props}>
      {children}
    </Component>
  );
}
export default Typography;
