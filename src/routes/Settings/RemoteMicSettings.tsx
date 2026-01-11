import { useEffect } from 'react';
import { useUpdate } from 'react-use';
import { MenuButton } from '~/modules/Elements/Menu';
import MenuWithLogo from '~/modules/Elements/MenuWithLogo';
import { Switcher } from '~/modules/Elements/Switcher';
import events from '~/modules/GameEvents/GameEvents';
import { useEventListenerSelector } from '~/modules/GameEvents/hooks';
import useBackgroundMusic from '~/modules/hooks/useBackgroundMusic';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import useSmoothNavigate from '~/modules/hooks/useSmoothNavigate';
import RemoteMicManager from '~/modules/RemoteMic/RemoteMicManager';
import {
  DefaultRemoteMicPermission,
  RemoteMicConnectionType,
  RemoteMicConnectionTypeSetting,
  RemoteMicPermissions,
  UnassignOnSongFinishedSetting,
  useSettingValue,
} from '~/routes/Settings/SettingsState';

import { Checkbox } from '~/modules/Elements/AKUI/Checkbox';
import { Menu } from '~/modules/Elements/AKUI/Menu';
import { nextValue } from '~/modules/Elements/Utils/indexes';
import { GAME_CODE_LENGTH, storeGameCode } from '~/modules/RemoteMic/Network/Server/NetworkServer';
import { useDevicePing } from '~/routes/SelectInput/hooks/useDevicePing';

function RemoteMicSettings() {
  useBackgroundMusic(false);
  const navigate = useSmoothNavigate();
  const goBack = () => navigate('settings/');

  const { register } = useKeyboardNav({ onBackspace: goBack });

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
      <Switcher
        {...register('connection type', () =>
          setRemoteMicConnectionType(nextValue(RemoteMicConnectionType, remoteMicConnectionType)),
        )}
        label="Connection type"
        value={remoteMicConnectionType}
      />
      <hr />
      <Switcher
        {...register('default-permission', () =>
          setDefaultPermission(nextValue(RemoteMicPermissions, defaultPermission)),
        )}
        label="Default permission"
        info={
          <>
            <strong>WRITE</strong> - player is able to navigate the menus remotely and assign themselves and other
            players to the game.
            <br />
            <strong>READ</strong> - player will only be able to use the device as a microphone with no control over the
            game.
          </>
        }
        value={defaultPermission.toUpperCase()}
      />
      <Checkbox
        size="small"
        checked={unassignOnSongFinished}
        {...register('unassign-on-song-finished', () => setUnassignOnSongFinished(!unassignOnSongFinished))}
        info={`Prevents "ghost" players - remote mics sticking around, not singing subsequent songs.`}>
        Unassign players after they finish singing
      </Checkbox>
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
      <MenuButton {...register('back-button', goBack)}>Return To Settings</MenuButton>
    </MenuWithLogo>
  );
}
const DevicePing = ({ deviceId }: { deviceId: string }) => {
  const latency = useDevicePing(deviceId);

  return latency === null ? null : <>{latency}ms</>;
};

export default RemoteMicSettings;
