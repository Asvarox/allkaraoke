import styled from '@emotion/styled';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';

function SuggestMobilePhone() {
  const [, setMobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);

  const setPhoneMode = async () => {
    try {
      setMobilePhoneMode(true);
      await document.body.requestFullscreen();
      window.screen.orientation.unlock();
      await window.screen.orientation.lock('landscape');
    } catch (e) {
      console.info(e);
    }
  };

  return (
    <Container>
      <Modal>
        <h1>Use Mobile Phone Mode?</h1>
        <h3>
          The regular version of the game isn't optimal for smaller screens. Enable the Mobile Phone Mode to adjust the
          UI and gameplay elements. Use this, or connect other mobiles to sing songs.
        </h3>
        <h3>
          You can always change the setting in the <strong>Settings</strong> menu.
        </h3>
        <MenuButton focused onClick={setPhoneMode} data-test="enable-mobile-mode">
          Enable Mobile Phone Mode
        </MenuButton>
        <MenuButton onClick={() => setMobilePhoneMode(false)} data-test="dismiss-mobile-mode">
          Dismiss
        </MenuButton>
      </Modal>
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled(MenuContainer)`
  max-width: 150rem;
  padding: calc(min(3vw, 4vh));
  margin: auto;
  h1 {
    font-size: calc(min(4vw, 5vh));
    margin-bottom: 0.75em;
  }
  h3 {
    font-size: calc(min(3vw, 4vh));
    line-height: 1.25;
    margin-bottom: 1em;
  }
  ${MenuButton} {
    font-size: calc(min(3vw, 4vh));
    height: auto;
    padding: calc(min(3vw, 4vh));
  }
`;

export default SuggestMobilePhone;
