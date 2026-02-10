import { ComponentProps, ReactNode } from 'react';
import { Button, ButtonLink } from '~/modules/Elements/AKUI/Button';
import { InputWrapper } from '~/modules/Elements/AKUI/InputWrapper';

type Props = Omit<ComponentProps<typeof Button> | ComponentProps<typeof ButtonLink>, ''> & {
  info?: ReactNode;
};
export const MenuButton = ({ info, className, ...props }: Props) => {
  const Component = 'href' in props ? ButtonLink : Button;

  return (
    <InputWrapper info={info}>
      {/* @ts-expect-error either Button or a link */}
      <Component {...props} className={`${className}`} />
    </InputWrapper>
  );
};
