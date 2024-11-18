import Box from 'modules/Elements/AKUI/Primitives/Box';
import isE2E from 'modules/utils/isE2E';
import { HTMLProps, PropsWithChildren, ReactNode } from 'react';
import { twc } from 'react-twc';

export const ButtonBase = twc(Box)((props) => {
  return [
    `!flex-row duration-300 text-md typography cursor-pointer justify-center border-0 bg-black/75 !text-white uppercase`,
    !isE2E() && props['data-focused'] ? 'animate-button-focused scale-105' : '',
    props['data-focused'] ? 'bg-active' : '',
    props['disabled']
      ? 'cursor-default !text-gray-300 bg-gray-500 pointer-events-none !animate-none !scale-100'
      : 'active:bg-active',
    props['data-inactive'] ? '!line-through decoration-white opacity-25' : '!no-underline',
  ];
});

interface Props extends PropsWithChildren {
  title?: ReactNode;
}
export const Button = ({ children, ...props }: Props & Omit<HTMLProps<HTMLButtonElement>, ''>) => (
  <ButtonBase className="" {...props} as="button">
    {children}
  </ButtonBase>
);
export const ButtonLink = ({ children, ...props }: Props & Omit<HTMLProps<HTMLAnchorElement>, ''>) => (
  <ButtonBase {...props} as="a">
    {children}
  </ButtonBase>
);
