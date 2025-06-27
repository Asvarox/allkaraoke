import styled from '@emotion/styled';
import { MenuButton } from 'modules/Elements/Menu';
import MenuWithLogo from 'modules/Elements/MenuWithLogo';
import { Switcher } from 'modules/Elements/Switcher';
import events from 'modules/GameEvents/GameEvents';
import { useEventListenerSelector } from 'modules/GameEvents/hooks';
import useBackgroundMusic from 'modules/hooks/useBackgroundMusic';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import useSmoothNavigate from 'modules/hooks/useSmoothNavigate';
import RemoteMicManager from 'modules/RemoteMic/RemoteMicManager';
import { useEffect } from 'react';
import { useUpdate } from 'react-use';
import {
  DefaultRemoteMicPermission,
  RemoteMicConnectionType,
  RemoteMicConnectionTypeSetting,
  RemoteMicPermissions,
  UnassignOnSongFinishedSetting,
  useSettingValue,
} from 'routes/Settings/SettingsState';

import { Checkbox } from 'modules/Elements/AKUI/Checkbox';
import { nextValue } from 'modules/Elements/Utils/indexes';
import { GAME_CODE_LENGTH, storeGameCode } from 'modules/RemoteMic/Network/Server/NetworkServer';
import { useDevicePing } from 'routes/SelectInput/hooks/useDevicePing';

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
      <h1
        onClick={() => {
          const code = prompt('Code');

          if (code?.length === GAME_CODE_LENGTH - 1) {
            storeGameCode(code);

            global.location.reload();
          }
        }}>
        Remote Microphone Settings
      </h1>
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
            <strong>READ</strong> - player will only be able to use the device as a microphone and otherwise have no
            control over the game.
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
      <h3>Connected devices permissions:</h3>
      {remoteMics.map((mic) => {
        const permission = RemoteMicManager.getPermission(mic.id);
        return (
          <RemoteMicEntry
            key={mic.id}
            {...register(
              `mic-${mic.id}`,
              () => RemoteMicManager.setPermission(mic.id, nextValue(RemoteMicPermissions, permission)),
              'Change permissions',
            )}
            data-test="remote-mic-entry"
            data-id={mic.id}
            value={permission}
            label={
              <EntryLabel>
                <RemoteMicId>{mic.id.slice(-4)}</RemoteMicId>
                <RemoteMicPing>
                  <DevicePing deviceId={mic.id} />
                </RemoteMicPing>
                <RemoteMicName className="ph-no-capture">{mic.name}</RemoteMicName>
              </EntryLabel>
            }
          />
        );
      })}
      {remoteMics.length === 0 && <h4>No remote microphones connected</h4>}
      <hr />
      <MenuButton {...register('back-button', goBack)}>Return To Settings</MenuButton>
    </MenuWithLogo>
  );
}

const DevicePing = ({ deviceId }: { deviceId: string }) => {
  const latency = useDevicePing(deviceId);

  return latency === null ? null : <>{latency}ms</>;
};

const EntryLabel = styled.span`
  text-transform: uppercase;
`;

const RemoteMicEntry = styled(Switcher)`
  text-transform: uppercase;
`;

const RemoteMicName = styled.span``;
const RemoteMicId = styled.span`
  font-size: 1.5rem;
  padding-right: 1rem;
`;
const RemoteMicPing = styled.span`
  font-size: 1.5rem;
  padding-right: 2rem;
  text-transform: none;
`;
export default RemoteMicSettings;
