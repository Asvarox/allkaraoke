import { Button, ButtonLink } from 'modules/Elements/AKUI/Button';
import { ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Button> | ComponentProps<typeof ButtonLink>, 'size'> & {
  size?: 'regular' | 'small';
};
export const MenuButton = ({ size = 'regular', className, ...props }: Props) => {
  const Component = 'href' in props ? ButtonLink : Button;
  return (
    // @ts-expect-error either Button or a link
    <Component {...props} data-size={size} className={`${size === 'small' ? 'h-20' : 'h-36'} ${className}`} />
  );
};
