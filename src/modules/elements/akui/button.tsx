import { ComponentProps, ComponentType, HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import useResponsiveValue from '~/modules/elements/akui/hooks/use-responsive-value';
import Box from '~/modules/elements/akui/primitives/box';
import { ResponsiveValue } from '~/modules/elements/akui/types';
import isE2E from '~/modules/utils/is-e2-e';
import { twx } from '~/utils/twx';

const sizeToClass = {
  mini: 'h-10 text-md px-2.5',
  small: 'h-14 text-lg mobile:h-12 mobile:text-md landscap:text-md',
  regular: 'text-lg h-20 mobile:text-md mobile:h-16 landscap:text-md',
  large: 'h-20 text-xl',
};

export const ButtonBase = twx(Box)((props) => {
  return [
    `typography shadow-focusable pointer-events-auto relative cursor-pointer flex-row! justify-center gap-2 border-0 bg-black/45 bg-black/55! px-4 font-bold uppercase duration-300`,
    !isE2E() && props['data-focused'] && !props['data-subtle-focus']
      ? 'bg-active! scale-[1.025] text-shadow-[0px_0px_3px_#000000]'
      : '',
    !isE2E() && props['data-focused'] ? 'scale-[1.025]' : '',
    !isE2E() && props['data-focused'] && props['data-subtle-focus'] ? 'animate-focused' : '',
    props['disabled']
      ? 'pointer-events-none scale-100! animate-none! cursor-default bg-gray-500! text-gray-300!'
      : 'active:bg-active',
    props['data-inactive'] ? 'line-through! decoration-white opacity-25' : 'no-underline!',
    props['data-read-only'] ? 'cursor-default! active:bg-black/75' : '',
    sizeToClass[(props['data-size'] as keyof typeof sizeToClass) || 'regular'],
  ];
});

export type ButtonSize = 'large' | 'regular' | 'small' | 'mini';

// Icon glyphs are sized off the button's own `size` so every button renders its icons consistently.
const sizeToIconClass = {
  mini: 'size-5',
  small: 'size-6',
  regular: 'size-8',
  large: 'size-8',
} satisfies Record<ButtonSize, string>;

interface Props extends PropsWithChildren {
  title?: ReactNode;
  inactive?: boolean;
  readOnly?: boolean;
  focused?: boolean;
  subtleFocused?: boolean;
  size?: ResponsiveValue<ButtonSize>;
  /** Icon shown before the label. When set, a matching gutter is reserved on the other side too. */
  leftIcon?: ReactNode;
  /** Icon shown after the label. When set, a matching gutter is reserved on the other side too. */
  rightIcon?: ReactNode;
}

const additionalProps = ({ inactive, readOnly, focused, subtleFocused, leftIcon, rightIcon, ...props }: Props) => ({
  ...props,
  ...(focused ? { 'data-focused': true } : {}),
  ...(subtleFocused ? { 'data-subtle-focus': true } : {}),
  ...(inactive ? { 'data-inactive': true } : {}),
  ...(readOnly ? { 'data-read-only': true, 'aria-readonly': true } : {}),
});

// A fixed-width icon gutter. Rendered on BOTH sides whenever the button has any icon (the empty side
// stays as a spacer) so the label stays optically centered regardless of which side the icon is on.
const IconSlot = ({ size, children }: { size: ButtonSize; children?: ReactNode }) => (
  <span
    aria-hidden={children == null || undefined}
    className={twMerge('flex shrink-0 items-center justify-center [&>svg]:size-full', sizeToIconClass[size])}>
    {children}
  </span>
);

// When the button has any icon we pin each icon to its edge and keep the label centered. Both
// gutters are always rendered (the empty side is just a spacer), so the label sits in the exact
// same place whether the button has a left icon, a right icon, both, or — via a sibling with the
// same size — none.
const ButtonContent = ({
  size,
  leftIcon,
  rightIcon,
  children,
}: {
  size: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}) => {
  if (leftIcon == null && rightIcon == null) return <>{children}</>;
  return (
    <span className="flex w-full items-center justify-between gap-2">
      <IconSlot size={size}>{leftIcon}</IconSlot>
      {/* `truncate` needs the shrink `min-w-0` already here to have a bounded width to ellipsize
          against - without it the span would grow to fit its content instead of wrapping/clipping. */}
      <span className="min-w-0 truncate text-center">{children}</span>
      <IconSlot size={size}>{rightIcon}</IconSlot>
    </span>
  );
};

export const Button = ({
  children,
  size = 'regular',
  className,
  leftIcon,
  rightIcon,
  ...props
}: Props & Omit<HTMLProps<HTMLButtonElement>, 'size'>) => {
  const resolvedSize = useResponsiveValue(size);
  return (
    <ButtonBase data-size={resolvedSize} className={className} {...additionalProps(props)} as="button">
      <ButtonContent size={resolvedSize} leftIcon={leftIcon} rightIcon={rightIcon}>
        {children}
      </ButtonContent>
    </ButtonBase>
  );
};
export const ButtonLink = ({
  children,
  size = 'regular',
  className,
  leftIcon,
  rightIcon,
  ...props
}: Props & Omit<HTMLProps<HTMLAnchorElement>, 'size'>) => {
  const resolvedSize = useResponsiveValue(size);
  return (
    <ButtonBase data-size={resolvedSize} className={className} {...additionalProps(props)} as="a">
      <ButtonContent size={resolvedSize} leftIcon={leftIcon} rightIcon={rightIcon}>
        {children}
      </ButtonContent>
    </ButtonBase>
  );
};

Button.Icon = ({
  Icon,
  className,
  ...rest
}: {
  Icon: ComponentType<{ className?: ComponentProps<'svg'>['className'] }>;
  className?: ComponentProps<'svg'>['className'];
}) => <Icon {...rest} className={twMerge('h-8! w-8!', className)} />;
