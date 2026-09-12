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
      // No `[&_a]:typography` here: it and `[&_a]:text-active` are one class group under one
      // modifier, so the merge always drops the first. Anchors take the active colour, which is
      // what it was there for.
      className={cn(`typography [&_a]:text-active text-md ${active ? 'text-active' : ''}`, className)}
      {...props}>
      {children}
    </Component>
  );
}
export default Typography;
