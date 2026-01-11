import styled from '@emotion/styled';
import { Laptop, PhoneAndroid, Wifi } from '@mui/icons-material';
import React, { useEffect } from 'react';
import { MenuButton, MenuContainer } from '~/modules/Elements/Menu';
import Modal from '~/modules/Elements/Modal';
import styles from '~/modules/GameEngine/Drawing/styles';
import storage from '~/modules/utils/storage';

interface Props {
  onClose?: () => void;
}

const CONFIRM_WIFI_KEY = 'confirmed-wifi';

export default function ConfirmWifiModal({ onClose }: Props) {
  const [closed, setClosed] = React.useState(storage.session.getItem(CONFIRM_WIFI_KEY) ?? false);

  const closeModal = () => {
    storage.session.setItem(CONFIRM_WIFI_KEY, true);
    setClosed(true);
    onClose?.();
  };

  useEffect(() => {
    if (navigator?.connection) {
      if (navigator?.connection?.type === 'wifi') {
        closeModal();
      } else {
        const onChange = () => {
          if (navigator?.connection?.type === 'wifi') {
            closeModal();
          }
        };
        navigator?.connection?.addEventListener?.('change', onChange);

        return () => navigator?.connection?.removeEventListener?.('change', onChange);
      }
    }
  }, []);

  return (
    <Modal onClose={closeModal} open={!closed}>
      <Menu>
        <Wrapper>
          <h3>
            Connect to the <strong>same Wi-Fi</strong>
          </h3>
          <IconsWrapper>
            <PhoneAndroid />
            ...
            <Wifi />
            ...
            <Laptop />
          </IconsWrapper>

          <h4>Connect to the same Wi-Fi as the game.</h4>
        </Wrapper>
        <h6>Otherwise microphones might not work properly.</h6>
        <MenuButton onClick={closeModal} focused data-test="confirm-wifi-connection">
          I&#39;m connected, continue
        </MenuButton>
      </Menu>
    </Modal>
  );
}

const Menu = styled(MenuContainer)`
  gap: 1rem;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const IconsWrapper = styled.div`
  margin: 2rem 0;
  display: flex;
  color: white;
  align-items: center;
  gap: 2rem;

  @keyframes pulse {
    0% {
      color: ${styles.colors.text.default};
      transform: scale(1);
    }
    25% {
      color: ${styles.colors.text.active};
      transform: scale(1.1);
    }
    50% {
      color: ${styles.colors.text.default};
      transform: scale(1);
    }
  }

  svg {
    animation: pulse 2s infinite;
    font-size: 7rem;

    :nth-of-type(1) {
      animation-delay: 0s;
    }
    :nth-of-type(2) {
      animation-delay: 0.5s;
    }
    :nth-of-type(3) {
      animation-delay: 1s;
    }
  }
`;
