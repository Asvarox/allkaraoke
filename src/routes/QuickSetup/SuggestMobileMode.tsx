import { Menu } from '~/modules/Elements/AKUI/Menu';
import { MenuButton, MenuContainer } from '~/modules/Elements/Menu';
import LayoutGame from '~/routes/LayoutGame';
import { MobilePhoneModeSetting, useSettingValue } from '~/routes/Settings/SettingsState';

function SuggestMobilePhone() {
  const [, setMobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);

  const setPhoneMode = async () => {
    try {
      setMobilePhoneMode(true);
      await document.body.requestFullscreen();
      global.screen.orientation.unlock();
      await global.screen.orientation.lock?.('landscape');
    } catch (e) {
      console.info(e);
    }
  };

  return (
    <LayoutGame>
      <div className="fixed inset-0 flex items-center justify-center">
        <MenuContainer className="m-auto max-w-[94rem] p-8">
          <Menu.Header>Use Mobile Phone Mode?</Menu.Header>
          <span className="typography mb-4 block text-lg">
            The regular version of the game isn&#39;t optimal for smaller screens. Enable the Mobile Phone Mode to
            adjust the UI and gameplay elements. Use this, or connect other mobiles to sing songs.
          </span>
          <span className="typography mb-4 block text-lg">
            You can always change the setting in the <strong>Settings</strong> menu.
          </span>
          <MenuButton focused onClick={setPhoneMode} data-test="enable-mobile-mode">
            Enable Mobile Phone Mode
          </MenuButton>
          <MenuButton onClick={() => setMobilePhoneMode(false)} data-test="dismiss-mobile-mode">
            Dismiss
          </MenuButton>
        </MenuContainer>
      </div>
    </LayoutGame>
  );
}

export default SuggestMobilePhone;
