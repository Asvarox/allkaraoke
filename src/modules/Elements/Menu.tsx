import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Menu } from 'modules/Elements/AKUI/Menu';
import { ComponentProps } from 'react';
import { Button, LinkButton } from './Button';

type ButtonSizes = 'small' | 'normal';

const menuButtonDisabled = css`
  cursor: default;
  color: #989898;
  background-color: #212121;
  border-width: 0.3rem;
  pointer-events: none;
`;

const menuButtonCss = css`
  margin: 0.5rem 0;
  height: 10rem;
  border: 0 solid black;

  &[data-disabled='true'] {
    ${menuButtonDisabled}
  }

  &[data-size='small'] {
    height: 5rem;
  }
`;

const MenuBaseLink = styled(LinkButton)`
  ${menuButtonCss}
`;

const MenuBaseButton = styled(Button)`
  ${menuButtonCss}
`;
export const MenuButton = ({
  size,
  disabled,
  ...props
}: (ComponentProps<typeof Button> | ComponentProps<typeof LinkButton>) & {
  size?: ButtonSizes;
  disabled?: boolean;
}) => {
  const Component = 'href' in props ? MenuBaseLink : MenuBaseButton;
  return (
    // @ts-expect-error either Button or a link
    <Component {...props} data-disabled={disabled} data-size={size} />
  );
};
export const MenuContainer = Menu;
