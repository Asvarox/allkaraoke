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
  top: 0;
  left: 0;
  transform-origin: center;
  transform: translate(50vw, 50vh);
`;

const Logo = styled(LogoIcon)`
  transform-origin: bottom;
  transform: scale(2);

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
