import { ComponentProps, ComponentType, HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Box from '~/modules/Elements/AKUI/Primitives/Box';
import isE2E from '~/modules/utils/isE2E';
import { twx } from '~/utils/twx';

const sizeToClass = {
  mini: 'h-10 text-sm',
  small: 'h-14 text-lg mobile:h-12 mobile:text-sm landscap:text-md',
  regular: 'text-lg h-20 mobile:text-sm mobile:h-16 landscap:text-md',
  large: 'h-20 text-xl',
};

export const ButtonBase = twx(Box)((props) => {
  return [
    `typography shadow-focusable pointer-events-auto relative cursor-pointer flex-row! justify-center gap-4 border-0 bg-black/75 px-4 text-white uppercase duration-300`,
    !isE2E() && props['data-focused'] && !props['data-subtle-focus']
      ? 'bg-active animate-button-focused scale-[1.025] shadow-none'
      : '',
    !isE2E() && props['data-focused'] ? 'scale-[1.025]' : '',
    !isE2E() && props['data-focused'] && props['data-subtle-focus'] ? 'animate-focused' : '',
    props['disabled']
      ? 'pointer-events-none scale-100! animate-none! cursor-default bg-gray-500 text-gray-300!'
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
