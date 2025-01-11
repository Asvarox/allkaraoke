import Box from 'modules/Elements/AKUI/Primitives/Box';
import isE2E from 'modules/utils/isE2E';
import { HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { twc } from 'react-twc';

export const ButtonBase = twc(Box)((props) => {
  return [
    `!flex-row duration-300 text-md typography cursor-pointer justify-center border-0 bg-black/75 text-white uppercase shadow-focusable pointer-events-auto`,
    !isE2E() && props['data-focused'] ? 'animate-button-focused scale-105' : '',
    props['data-focused'] ? 'bg-active shadow-none' : '',
    props['disabled']
      ? 'cursor-default !text-gray-300 bg-gray-500 pointer-events-none !animate-none !scale-100'
      : 'active:bg-active',
    props['data-inactive'] ? '!line-through decoration-white opacity-25' : '!no-underline',
    props['data-read-only'] ? '!cursor-default active:bg-black/75' : '',
  ];
});

interface Props extends PropsWithChildren {
  title?: ReactNode;
  inactive?: boolean;
  readOnly?: boolean;
  focused?: boolean;
}

const additionalProps = ({ inactive, readOnly, focused, ...props }: Props) => ({
  ...props,
  ...(focused ? { 'data-focused': true } : {}),
  ...(inactive ? { 'data-inactive': true } : {}),
  ...(readOnly ? { 'data-read-only': true, 'aria-readonly': true } : {}),
});

export const Button = ({ children, ...props }: Props & Omit<HTMLProps<HTMLButtonElement>, ''>) => (
  <ButtonBase className="" {...additionalProps(props)} as="button">
    {children}
  </ButtonBase>
);
export const ButtonLink = ({ children, ...props }: Props & Omit<HTMLProps<HTMLAnchorElement>, ''>) => (
  <ButtonBase {...additionalProps(props)} as="a">
    {children}
  </ButtonBase>
);
