import { ComponentProps, HTMLProps, PropsWithChildren, ReactNode } from 'react';

import { MenuButton } from '~/modules/elements/akui/menu/menu-button';
import Box from '~/modules/elements/akui/primitives/box';
import Typography from '~/modules/elements/akui/primitives/typography';
import { dialogSurface } from '~/modules/elements/akui/surfaces';
import isE2E from '~/modules/utils/is-e2-e';
import { twx } from '~/utils/twx';

// Styling lives in the `menu-neighbour-glow` rules in index.css (needs a real CSS transition to
// fade in/out, which arbitrary Tailwind variants can't express cleanly). Skipped in e2e so it
// doesn't chase the same non-determinism the base focus styles avoid (see button.tsx).
const MenuContainer = twx(Box)(() => [
  'pointer-events-auto w-[100vw] items-stretch rounded-none [view-transition-name:menu-container] sm:max-w-[45rem] md:rounded-xl lg:max-w-[45rem] 2xl:max-w-[60rem]',
  !isE2E() && 'menu-neighbour-glow',
]);

export const MenuHelpText = twx(Typography)`text-md max-lg:text-xs`;
const MenuSubHeader = twx(Typography)`text-lg`;

interface MenuProps extends PropsWithChildren, Omit<HTMLProps<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  spacing?: 'regular' | 'tight';
  /** Build this menu from the shared `dialogSurface`, so it reads as part of the app rather than a
   * system dialog. Set on the top-level `Menu` a `Modal` wraps. */
  modal?: boolean;
}
export const Menu = ({ title, children, className, spacing = 'regular', modal = false, ref, ...props }: MenuProps) => (
  <MenuContainer
    {...props}
    className={`${modal ? `${dialogSurface} ` : ''}${className ?? ''} ${spacing === 'tight' ? 'gap-2 p-4' : 'gap-4 p-4 sm:p-6'}`}
    ref={ref}>
    {title && <MenuHeader>{title}</MenuHeader>}
    {children}
  </MenuContainer>
);

Menu.Header = twx(
  Typography,
)`text-active flex items-center justify-center text-xl font-bold uppercase text-shadow-[0px_0px_3px_#000000] max-lg:text-lg`;
export const MenuHeader = Menu.Header;

Menu.Button = MenuButton;
Menu.ButtonGroup = twx.div`flex`;
Menu.HelpText = MenuHelpText;
Menu.SubHeader = MenuSubHeader;
Menu.Divider = ({ className, ...props }: ComponentProps<'hr'>) => (
  <hr className={['border-white/20', className].filter(Boolean).join(' ')} {...props} />
);
