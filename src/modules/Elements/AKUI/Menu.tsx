import { MenuButton } from 'modules/Elements/AKUI/Menu/MenuButton';
import Box from 'modules/Elements/AKUI/Primitives/Box';
import Text from 'modules/Elements/AKUI/Primitives/Text';
import { HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { twc } from 'react-twc';

const MenuContainer = twc(
  Box,
)`w-[100vw] max-w-[75rem] m-[2rem auto 0 auto] [view-transition-name:menu-container] items-stretch`;

export const MenuHeader = twc(Text)`text-xl text-active flex items-center justify-center`;

interface MenuProps extends PropsWithChildren, Omit<HTMLProps<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  spacing?: 'regular' | 'tight';
}
export const Menu = ({ title, children, className, spacing = 'regular', ...props }: MenuProps) => (
  <MenuContainer {...props} className={`${className} ${spacing === 'tight' ? 'p-6 gap-1' : 'p-10 gap-4'}`}>
    {title && <MenuHeader>{title}</MenuHeader>}
    {children}
  </MenuContainer>
);

Menu.Header = MenuHeader;
Menu.Button = MenuButton;
Menu.Divider = () => <hr />;
