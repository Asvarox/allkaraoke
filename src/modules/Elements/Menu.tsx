import { css, cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { ComponentProps } from 'react';
import { Button, LinkButton } from './Button';

type ButtonSizes = 'small' | 'normal';

const menuButtonCss = css`
  margin: 0.5rem 0;
  height: 10rem;
  border: 0 solid black;
`;

const menuButtonSmall = css`
  height: 5rem;
`;

const menuButtonDisabled = css`
  cursor: default;
  color: #989898;
  background-color: #212121;
  border-width: 0.3rem;
  pointer-events: none;
`;

export const MenuButton = ({
  className,
  size,
  disabled,
  ...props
}: (ComponentProps<typeof Button> | ComponentProps<typeof LinkButton>) & {
  size?: ButtonSizes;
  disabled?: boolean;
}) => {
  const Component = 'href' in props ? LinkButton : Button;
  return (
    // @ts-expect-error either Button or a link
    <Component
      {...props}
      className={cx(menuButtonCss, size === 'small' && menuButtonSmall, disabled && menuButtonDisabled, className)}
    />
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
