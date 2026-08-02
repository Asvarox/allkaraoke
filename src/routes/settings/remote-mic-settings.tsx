import { useEffect } from 'react';
import { useUpdate } from 'react-use';

import { Menu } from '~/modules/elements/akui/menu';
import MenuWithLogo from '~/modules/elements/menu-with-logo';
import { NavButton, NavCheckbox, NavSwitcher } from '~/modules/elements/nav-controls';
import { Switcher } from '~/modules/elements/switcher';
import events from '~/modules/game-events/game-events';
import { useEventListenerSelector } from '~/modules/game-events/hooks';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import useSmoothNavigate from '~/modules/hooks/use-smooth-navigate';
import { GAME_CODE_LENGTH, storeGameCode } from '~/modules/remote-mic/network/server/network-server';
import RemoteMicManager from '~/modules/remote-mic/remote-mic-manager';
import { nextValue } from '~/modules/utils/indexes';
import { useDevicePing } from '~/routes/select-input/hooks/use-device-ping';
import {
  DefaultRemoteMicPermission,
  RemoteMicConnectionType,
  RemoteMicConnectionTypeSetting,
  RemoteMicPermissions,
  UnassignOnSongFinishedSetting,
  useSettingValue,
} from '~/routes/settings/settings-state';

function RemoteMicSettings() {
  useBackgroundMusic(false);
  const navigate = useSmoothNavigate();
  const goBack = () => navigate('settings/');

  const { register } = useKeyboardNav({ onBackspace: goBack, title: 'Remote Microphone Settings' });

  const [remoteMicConnectionType, setRemoteMicConnectionType] = useSettingValue(RemoteMicConnectionTypeSetting);
  const [defaultPermission, setDefaultPermission] = useSettingValue(DefaultRemoteMicPermission);
  const [unassignOnSongFinished, setUnassignOnSongFinished] = useSettingValue(UnassignOnSongFinishedSetting);
  const remoteMics = useEventListenerSelector(events.inputListChanged, () => RemoteMicManager.getRemoteMics());

  const forceUpdate = useUpdate();
  useEffect(() => RemoteMicManager.addListener(forceUpdate), [forceUpdate]);

  return (
    <MenuWithLogo>
      <Menu.Header
        onClick={() => {
          const code = prompt('Code');

          if (code?.length === GAME_CODE_LENGTH - 1) {
            storeGameCode(code);

            global.location.reload();
          }
        }}>
        Remote Microphone Settings
      </Menu.Header>
      <KeyboardNavContext value={register}>
        <NavSwitcher
          name="connection type"
          label="Connection type"
          value={remoteMicConnectionType}
          onClick={() => setRemoteMicConnectionType(nextValue(RemoteMicConnectionType, remoteMicConnectionType))}
        />
        <hr />
        <NavSwitcher
          name="default-permission"
          label="Default permission"
          info={
            <>
              <strong>WRITE</strong> - player is able to navigate the menus remotely and assign themselves and other
              players to the game.
              <br />
              <strong>READ</strong> - player will only be able to use the device as a microphone with no control over
              the game.
            </>
          }
          value={defaultPermission.toUpperCase()}
          onClick={() => setDefaultPermission(nextValue(RemoteMicPermissions, defaultPermission))}
        />
        <NavCheckbox
          size="small"
          name="unassign-on-song-finished"
          label="Unassign players after they finish singing"
          checked={unassignOnSongFinished}
          onClick={() => setUnassignOnSongFinished(!unassignOnSongFinished)}
          info={`Prevents "ghost" players - remote mics sticking around, not singing subsequent songs.`}
        />
        <hr />
        <Menu.SubHeader>Connected devices permissions:</Menu.SubHeader>
        {remoteMics.map((mic) => {
          const permission = RemoteMicManager.getPermission(mic.id);
          return (
            <Switcher
              key={mic.id}
              className="uppercase"
              {...register(
                `mic-${mic.id}`,
                () => RemoteMicManager.setPermission(mic.id, nextValue(RemoteMicPermissions, permission)),
                'Change permissions',
                false,
                { control: { type: 'switch', label: mic.name, value: permission } },
              )}
              data-test="remote-mic-entry"
              data-id={mic.id}
              value={permission}
              label={
                <span className="inline-flex items-center uppercase">
                  <span className="text-md pr-4">{mic.id.slice(-4)}</span>
                  <div className="text-md w-20 pr-8 normal-case">
                    <DevicePing deviceId={mic.id} />
                  </div>
                  <span className="ph-no-capture">{mic.name}</span>
                </span>
              }
            />
          );
        })}
        {remoteMics.length === 0 && <Menu.HelpText>No remote microphones connected</Menu.HelpText>}
        <hr />
        <NavButton name="back-button" variant="back" onClick={goBack}>
          Return To Settings
        </NavButton>
      </KeyboardNavContext>
    </MenuWithLogo>
  );
}
const DevicePing = ({ deviceId }: { deviceId: string }) => {
  const latency = useDevicePing(deviceId);

  return latency === null ? null : <>{latency}ms</>;
};

export default RemoteMicSettings;
