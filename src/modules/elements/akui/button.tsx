import { cloneElement, HTMLProps, isValidElement, PropsWithChildren, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { ButtonSize, sizeToIconSize } from '~/modules/elements/akui/button-sizes';
import useResponsiveValue from '~/modules/elements/akui/hooks/use-responsive-value';
import { Icon, IconProps } from '~/modules/elements/akui/icon';
import Box from '~/modules/elements/akui/primitives/box';
import { ResponsiveValue } from '~/modules/elements/akui/types';
import isE2E from '~/modules/utils/is-e2-e';
import { twx } from '~/utils/twx';

export type { ButtonSize } from '~/modules/elements/akui/button-sizes';

const sizeToClass = {
  mini: 'h-10 text-md min-w-10',
  small: 'h-[50px] text-lg mobile:text-md landscap:text-md min-w-[50px]',
  regular: 'text-lg h-20 min-w-20 mobile:text-md mobile:h-16 mobile:min-w-16 landscap:text-md',
  large: 'h-20 text-xl min-w-20',
};

export const ButtonBase = twx(Box)((props) => {
  return [
    `typography shadow-focusable pointer-events-auto relative cursor-pointer flex-row! justify-center gap-2 border-0 bg-black/45 bg-black/55! px-3 font-bold uppercase duration-300`,
    !isE2E() && props['data-focused'] && !props['data-subtle-focus']
      ? 'bg-active! scale-[1.025] text-shadow-[0px_0px_3px_#000000]'
      : '',
    !isE2E() && props['data-focused'] ? 'scale-[1.025]' : '',
    !isE2E() && props['data-focused'] && props['data-subtle-focus'] ? 'subtle-focus' : '',
    !isE2E() && !props['disabled'] && !props['data-read-only'] ? 'hover:subtle-focus' : '',
    props['disabled']
      ? 'pointer-events-none scale-100! animate-none! cursor-default bg-gray-500! text-gray-300!'
      : 'active:bg-active',
    props['data-inactive'] ? 'line-through! decoration-white opacity-25' : 'no-underline!',
    props['data-read-only'] ? 'cursor-default! active:bg-black/75' : '',
    sizeToClass[(props['data-size'] as keyof typeof sizeToClass) || 'regular'],
  ];
});

// The gutter span itself can be sized via a Tailwind class (it's a plain `<span>`), but the icon
// inside it can't — see `sizeToIconSize` in `button-sizes.ts` for why it's cloned with an explicit
// `size` prop instead.
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
  fullWidth?: boolean;
  focused?: boolean;
  subtleFocused?: boolean;
  size?: ResponsiveValue<ButtonSize>;
  /** Icon shown before the label. When set, a matching gutter is reserved on the other side too. */
  leftIcon?: ReactNode;
  /** Icon shown after the label. When set, a matching gutter is reserved on the other side too. */
  rightIcon?: ReactNode;
  /**
   * How the label sits between the icon gutters. Buttons centre it; controls that read as a list of
   * options (the checkbox) left-align it so their labels line up with each other.
   */
  labelAlign?: 'center' | 'left';
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
    className={twMerge('flex shrink-0 items-center justify-center', sizeToIconClass[size])}>
    {isValidElement<Partial<IconProps>>(children) && children.type === Icon
      ? cloneElement(children, { size: sizeToIconSize[size] })
      : children}
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
  labelAlign = 'center',
  iconOnly,
  children,
  fullWidth,
}: {
  size: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  labelAlign?: 'center' | 'left';
  iconOnly?: boolean;
  children?: ReactNode;
  fullWidth?: boolean;
}) => {
  if (leftIcon == null && rightIcon == null) return <>{children}</>;

  if (iconOnly) {
    return <IconSlot size={size}>{leftIcon || rightIcon}</IconSlot>;
  }
  return (
    <span className="flex w-full items-center gap-2">
      {/* create gutter for icons only for full-width buttons */}
      {fullWidth || leftIcon ? <IconSlot size={size}>{leftIcon}</IconSlot> : null}
      {/* `flex-1` so the label owns all the room between the two gutters: that's what lets it be
          left-aligned against the icon. Centring is unchanged by it — the gutters are equal width, so
          text centred inside a filled middle lands exactly where the old `justify-between` put it.
          `truncate` needs the shrink `min-w-0` here to have a bounded width to ellipsize against -
          without it the span would grow to fit its content instead of clipping. */}
      <span className={twMerge('min-w-0 flex-1 truncate', labelAlign === 'left' ? 'text-left' : 'text-center')}>
        {children}
      </span>
      {/* create gutter for icons only for full-width buttons */}
      {fullWidth || rightIcon ? <IconSlot size={size}>{rightIcon}</IconSlot> : null}
    </span>
  );
};

export const Button = ({
  children,
  size = 'regular',
  className,
  leftIcon,
  rightIcon,
  labelAlign,
  fullWidth = true,
  ...props
}: Props & Omit<HTMLProps<HTMLButtonElement>, 'size'>) => {
  const iconOnly = Boolean(leftIcon || rightIcon) && children == null;
  const resolvedSize = useResponsiveValue(size);
  return (
    <ButtonBase
      data-size={resolvedSize}
      className={`${iconOnly ? 'aspect-square px-0' : ''} ${className}`}
      {...additionalProps(props)}
      as="button">
      <ButtonContent
        size={resolvedSize}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        labelAlign={labelAlign}
        iconOnly={iconOnly}
        fullWidth={fullWidth}>
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
  fullWidth = true,
  ...props
}: Props & Omit<HTMLProps<HTMLAnchorElement>, 'size'>) => {
  const iconOnly = Boolean(leftIcon || rightIcon) && children == null;

  const resolvedSize = useResponsiveValue(size);
  return (
    <ButtonBase
      data-size={resolvedSize}
      className={`${iconOnly ? 'aspect-square px-0' : ''} ${className}`}
      {...additionalProps(props)}
      as="a">
      <ButtonContent
        size={resolvedSize}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        fullWidth={fullWidth}
        iconOnly={iconOnly}>
        {children}
      </ButtonContent>
    </ButtonBase>
  );
};
