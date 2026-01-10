import Box from 'modules/Elements/AKUI/Primitives/Box';
import isE2E from 'modules/utils/isE2E';
import { ComponentProps, ComponentType, HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { twx } from 'utils/twx';

const sizeToClass = {
  mini: 'h-10 text-sm',
  small: 'h-14 text-lg mobile:h-12 mobile:text-sm landscap:text-md',
  regular: 'text-lg h-20 mobile:text-sm mobile:h-16 landscap:text-md',
  large: 'h-20 text-xl',
};

export const ButtonBase = twx(Box)((props) => {
  return [
    `px-4 relative flex-row! duration-300 typography cursor-pointer justify-center border-0 bg-black/75 text-white uppercase shadow-focusable pointer-events-auto gap-4`,
    !isE2E() && props['data-focused'] && !props['data-subtle-focus']
      ? 'bg-active shadow-none animate-button-focused scale-[1.025]'
      : '',
    !isE2E() && props['data-focused'] ? 'scale-[1.025]' : '',
    !isE2E() && props['data-focused'] && props['data-subtle-focus'] ? 'animate-focused' : '',
    props['disabled']
      ? 'cursor-default text-gray-300! bg-gray-500 pointer-events-none animate-none! scale-100!'
      : 'active:bg-active',
    props['data-inactive'] ? 'line-through! decoration-white opacity-25' : 'no-underline!',
    props['data-read-only'] ? 'cursor-default! active:bg-black/75' : '',
    sizeToClass[(props['data-size'] as keyof typeof sizeToClass) || 'regular'],
  ];
});

interface Props extends PropsWithChildren {
  title?: ReactNode;
  inactive?: boolean;
  readOnly?: boolean;
  focused?: boolean;
  subtleFocused?: boolean;
  size?: 'large' | 'regular' | 'small' | 'mini';
}

const additionalProps = ({ inactive, readOnly, focused, subtleFocused, ...props }: Props) => ({
  ...props,
  ...(focused ? { 'data-focused': true } : {}),
  ...(subtleFocused ? { 'data-subtle-focus': true } : {}),
  ...(inactive ? { 'data-inactive': true } : {}),
  ...(readOnly ? { 'data-read-only': true, 'aria-readonly': true } : {}),
});

export const Button = ({
  children,
  size = 'regular',
  className,
  ...props
}: Props & Omit<HTMLProps<HTMLButtonElement>, 'size'>) => (
  <ButtonBase data-size={size} className={className} {...additionalProps(props)} as="button">
    {children}
  </ButtonBase>
);
export const ButtonLink = ({
  children,
  size = 'regular',
  className,
  ...props
}: Props & Omit<HTMLProps<HTMLAnchorElement>, 'size'>) => (
  <ButtonBase data-size={size} className={className} {...additionalProps(props)} as="a">
    {children}
  </ButtonBase>
);

Button.Icon = ({
  Icon,
  className,
  ...rest
}: {
  Icon: ComponentType<{ className?: ComponentProps<'svg'>['className'] }>;
  className?: ComponentProps<'svg'>['className'];
}) => <Icon {...rest} className={twMerge('h-8! w-8!', className)} />;
