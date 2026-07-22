import { ComponentProps, HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { twc } from 'react-twc';

import { MenuButton } from '~/modules/elements/akui/menu/menu-button';
import Box from '~/modules/elements/akui/primitives/box';
import Typography from '~/modules/elements/akui/primitives/typography';
import isE2E from '~/modules/utils/is-e2-e';

// Styling lives in the `menu-neighbour-glow` rules in index.css (needs a real CSS transition to
// fade in/out, which arbitrary Tailwind variants can't express cleanly). Skipped in e2e so it
// doesn't chase the same non-determinism the base focus styles avoid (see button.tsx).
const MenuContainer = twc(Box)(() => [
  'pointer-events-auto w-[100vw] items-stretch rounded-none [view-transition-name:menu-container] sm:max-w-[45rem] md:rounded-xl lg:max-w-[45rem] 2xl:max-w-[60rem]',
  !isE2E() && 'menu-neighbour-glow',
]);

export const MenuHelpText = twc(Typography)`text-md mobile:text-xs`;
const MenuSubHeader = twc(Typography)`text-lg`;

interface MenuProps extends PropsWithChildren, Omit<HTMLProps<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  spacing?: 'regular' | 'tight';
}
export const Menu = ({ title, children, className, spacing = 'regular', ref, ...props }: MenuProps) => (
  <MenuContainer
    {...props}
    className={`${className} ${spacing === 'tight' ? 'gap-2 p-4' : 'gap-4 p-4 sm:p-7'}`}
    ref={ref}>
    {title && <MenuHeader>{title}</MenuHeader>}
    {children}
  </MenuContainer>
);

Menu.Header = twc(Typography)`mobile:text-xl text-active flex items-center justify-center text-2xl font-bold`;
export const MenuHeader = Menu.Header;

Menu.Button = MenuButton;
Menu.ButtonGroup = twc.div`flex`;
Menu.HelpText = MenuHelpText;
Menu.SubHeader = MenuSubHeader;
Menu.Divider = ({ className, ...props }: ComponentProps<'hr'>) => (
  <hr className={['border-white/20', className].filter(Boolean).join(' ')} {...props} />
);
