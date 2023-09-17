import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { useEffect, useState } from 'react';
import { MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';

interface Props {
  keyboardControl: boolean;
}

const SHOW_TIP_TIMEOUT_MS = 10_000;

export default function SelectRandomTip({ keyboardControl }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (!keyboardControl) {
      setIsVisible(false);
    } else {
      const timeout = setTimeout(() => setIsVisible(true), SHOW_TIP_TIMEOUT_MS);

      return () => clearTimeout(timeout);
    }
  }, [keyboardControl]);

  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);

  if (mobilePhoneMode) {
    return null;
  }

  return (
    <Container visible={isVisible}>
      Can't decide? Click <Kbd>Shift</Kbd> + <Kbd>R</Kbd> to pick random song
    </Container>
  );
}

const Container = styled.div<{ visible: boolean }>`
  @keyframes shake {
    2.5%,
    22.5% {
      transform: translate3d(-0.1rem, 0, 0);
    }

    5%,
    20% {
      transform: translate3d(0.2rem, 0, 0);
    }

    7.5%,
    12.5%,
    17.5% {
      transform: translate3d(-0.4rem, 0, 0);
    }

    10%,
    15% {
      transform: translate3d(0.4rem, 0, 0);
    }
  }
  animation: shake 5s both infinite;
  ${typography};
  pointer-events: none;
  position: fixed;
  transform: scale(${(props) => (props.visible ? 1 : 0)});
  opacity: ${(props) => (props.visible ? 1 : 0)};
  text-align: center;
  font-size: 4.8rem;
  text-shadow: 0 0 3.5rem black, 0 0 3.5rem black, 0 0 3.5rem black, 0 0 3.5rem black, 0 0 3.5rem black,
    0 0 3.5rem black, 0 0 3.5rem black;
  width: 100%;
  z-index: 4;
  padding: 2.5rem;
  transition: ease 500ms;
`;

const Kbd = styled.kbd<{ disabled?: boolean }>`
  margin: 0.1rem;
  padding: 0.2rem 2rem;
  border-radius: 1.5rem;
  border: 0.6rem solid rgb(204, 204, 204);
  border-bottom-color: rgb(150, 150, 150);
  border-right-color: rgb(150, 150, 150);
  line-height: 1.4;
  display: inline-block;
  background-color: rgb(247, 247, 247);
  text-shadow: 0 0.5rem 0 #fff;

  opacity: ${(props) => (props.disabled ? 0.25 : 1)};
`;
