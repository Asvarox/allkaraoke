import { HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { twc } from 'react-twc';
import { MenuButton } from '~/modules/Elements/AKUI/Menu/MenuButton';
import Box from '~/modules/Elements/AKUI/Primitives/Box';
import Typography from '~/modules/Elements/AKUI/Primitives/Typography';

const MenuContainer = twc(
  Box,
)`pointer-events-auto w-[100vw] items-stretch rounded-none bg-black/60 [view-transition-name:menu-container] sm:max-w-[45rem] md:rounded-md lg:max-w-[45rem] 2xl:max-w-[60rem]`;

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

Menu.Header = twc(Typography)`mobile:text-xl text-active flex items-center justify-center text-2xl`;
export const MenuHeader = Menu.Header;

Menu.Button = MenuButton;
Menu.ButtonGroup = twc.div`flex`;
Menu.HelpText = MenuHelpText;
Menu.SubHeader = MenuSubHeader;
Menu.Divider = () => <hr />;
