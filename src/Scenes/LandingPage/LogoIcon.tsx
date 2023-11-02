import styled from '@emotion/styled';
import { MicIconBlue, MicIconRed } from 'Elements/MicIcon';
import { ComponentProps } from 'react';

export default function LogoIcon(props: ComponentProps<typeof OptionIconContainer>) {
  return (
    <OptionIconContainer {...props}>
      <MicIconBlue />
      <MicIconRed />
    </OptionIconContainer>
  );
}

const OptionIconContainer = styled.div`
  position: relative;
  transition: 300ms;

  svg {
    transition: 300ms;
    width: 15rem;
    height: 15rem;
  }

  svg:first-of-type {
    top: 1.6rem;
    left: 3.5rem;
    position: absolute;
    z-index: 100;
    transform: scaleX(-1);
  }
`;
