import { Button, ButtonLink } from 'modules/Elements/AKUI/Button';
import { ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Button> | ComponentProps<typeof ButtonLink>, 'size'> & {
  size?: 'regular' | 'small';
  focused?: boolean;
};
export const MenuButton = ({ size = 'regular', focused = false, className, ...props }: Props) => {
  const Component = 'href' in props ? ButtonLink : Button;
  return (
    // @ts-expect-error either Button or a link
    <Component
      {...props}
      data-size={size}
      data-focused={focused}
      className={`my-2 ${size === 'small' ? 'h-20' : 'h-40'} ${className}`}
    />
  );
};
