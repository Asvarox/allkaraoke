import { css } from '@emotion/react';
import styled from '@emotion/styled';
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
export const MenuContainer = styled.div`
  background: rgba(0, 0, 0, 0.5);
  padding: 1.5rem;
  width: 100vw;
  box-sizing: border-box;
  max-width: 75rem;
  margin: 2rem auto 0 auto;
  font-size: 2.6rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  view-transition-name: menu-container;
`;
