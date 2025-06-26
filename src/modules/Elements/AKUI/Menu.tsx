import { MenuButton } from 'modules/Elements/AKUI/Menu/MenuButton';
import Box from 'modules/Elements/AKUI/Primitives/Box';
import Typography from 'modules/Elements/AKUI/Primitives/Typography';
import { HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { twc } from 'react-twc';

const MenuContainer = twc(
  Box,
)`w-[100vw] sm:max-w-[85rem] m-[2rem auto 0 auto] [view-transition-name:menu-container] items-stretch pointer-events-auto`;

export const MenuHeader = twc(Typography)`text-xl text-active flex items-center justify-center`;
export const MenuHelpText = twc(Typography)`text-md`;

interface MenuProps extends PropsWithChildren, Omit<HTMLProps<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  spacing?: 'regular' | 'tight';
}
export const Menu = ({ title, children, className, spacing = 'regular', ref, ...props }: MenuProps) => (
  <MenuContainer {...props} className={`${className} ${spacing === 'tight' ? 'gap-3 p-6' : 'gap-6 p-10'}`} ref={ref}>
    {title && <MenuHeader>{title}</MenuHeader>}
    {children}
  </MenuContainer>
);

Menu.Header = MenuHeader;
Menu.Button = MenuButton;
Menu.ButtonGroup = twc.div`flex`;
Menu.HelpText = MenuHelpText;
Menu.Divider = () => <hr />;
