import styled from '@emotion/styled';
import LogoIcon from 'Scenes/LandingPage/LogoIcon';
import { useEffect, useState } from 'react';

export default function PageLoader() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <Container visible={visible}>
      <Logo />
    </Container>
  );
}

const Container = styled.div<{ visible: boolean }>`
  transition: 500ms;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled(LogoIcon)`
  transform: translate(-1.75rem, -0.8rem) scale(2);

  svg {
    @keyframes pulse {
      0% {
        scale: 1;
      }
      33% {
        scale: 1.05;
      }
      66% {
        scale: 1;
      }
      100% {
        scale: 1;
      }
    }
    animation: pulse 1.25s infinite;
  }
  svg:first-of-type {
    animation-delay: 1s;
  }
`;
