import { MenuButton } from 'modules/Elements/AKUI/Menu/MenuButton';
import Box from 'modules/Elements/AKUI/Primitives/Box';
import Typography from 'modules/Elements/AKUI/Primitives/Typography';
import { HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { twc } from 'react-twc';

const MenuContainer = twc(
  Box,
)`w-[100vw] bg-black/60 sm:max-w-[45rem] lg:max-w-[45rem] 2xl:max-w-[60rem] rounded-none md:rounded-md [view-transition-name:menu-container] items-stretch pointer-events-auto`;

export const MenuHelpText = twc(Typography)`text-md mobile:text-xs`;
const MenuSubHeader = twc(Typography)`text-lg`;

interface MenuProps extends PropsWithChildren, Omit<HTMLProps<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  spacing?: 'regular' | 'tight';
}
export const Menu = ({ title, children, className, spacing = 'regular', ref, ...props }: MenuProps) => (
  <MenuContainer {...props} className={`${className} ${spacing === 'tight' ? 'gap-2 p-4' : 'gap-4 p-7'}`} ref={ref}>
    {title && <MenuHeader>{title}</MenuHeader>}
    {children}
  </MenuContainer>
);

Menu.Header = twc(Typography)`text-2xl mobile:text-xl text-active flex items-center justify-center`;
export const MenuHeader = Menu.Header;

Menu.Button = MenuButton;
Menu.ButtonGroup = twc.div`flex`;
Menu.HelpText = MenuHelpText;
Menu.SubHeader = MenuSubHeader;
Menu.Divider = () => <hr />;
