import { Laptop, PhoneAndroid, Wifi } from '@mui/icons-material';
import { Menu } from 'modules/Elements/AKUI/Menu';
import { MenuButton, MenuContainer } from 'modules/Elements/Menu';
import Modal from 'modules/Elements/Modal';
import styles from 'modules/GameEngine/Drawing/styles';
import storage from 'modules/utils/storage';
import React, { useEffect } from 'react';
import { twc } from 'react-twc';

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
      <style>{`
        @keyframes pulse {
          0% { color: ${styles.colors.text.default}; transform: scale(1); }
          25% { color: ${styles.colors.text.active}; transform: scale(1.1); }
          50% { color: ${styles.colors.text.default}; transform: scale(1); }
        }
      `}</style>
      <MenuComponent>
        <Wrapper>
          <span className="typography text-lg">
            Connect to the <strong>same Wi-Fi</strong>
          </span>
          <IconsWrapper>
            <PhoneAndroid />
            <Wifi />
            <Laptop />
          </IconsWrapper>

          <Menu.HelpText>Connect to the same Wi-Fi as the game.</Menu.HelpText>
        </Wrapper>
        <Menu.HelpText>Otherwise microphones might not work properly.</Menu.HelpText>
        <MenuButton onClick={closeModal} focused data-test="confirm-wifi-connection">
          I&#39;m connected, continue
        </MenuButton>
      </MenuComponent>
    </Modal>
  );
}

const MenuComponent = twc(MenuContainer)`gap-2.5`;

const Wrapper = twc.div`flex flex-col items-center gap-5`;

const IconsWrapper = twc.div`my-5 flex items-center gap-5 text-white [&_svg]:text-7xl [&_svg:nth-of-type(1)]:animate-[pulse_2s_infinite_0s] [&_svg:nth-of-type(2)]:animate-[pulse_2s_infinite_0.5s] [&_svg:nth-of-type(3)]:animate-[pulse_2s_infinite_1s]`;
