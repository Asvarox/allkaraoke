import styled from '@emotion/styled';
import { MenuButton } from 'Elements/Menu';
import MenuWithLogo from 'Elements/MenuWithLogo';
import { nextValue, Switcher } from 'Elements/Switcher';
import events from 'GameEvents/GameEvents';
import { useEventListenerSelector } from 'GameEvents/hooks';
import useBackgroundMusic from 'hooks/useBackgroundMusic';
import useKeyboardNav from 'hooks/useKeyboardNav';
import useSmoothNavigate from 'hooks/useSmoothNavigate';
import { useEffect } from 'react';
import { useUpdate } from 'react-use';
import RemoteMicManager from 'RemoteMic/RemoteMicManager';
import { DefaultRemoteMicPermission, RemoteMicPermissions, useSettingValue } from 'Scenes/Settings/SettingsState';
import { useDevicePing } from 'Scenes/SingASong/SongSelection/SongSettings/MicCheck/Ping';

interface Props {}

function RemoteMicSettings(props: Props) {
    useBackgroundMusic(false);
    const navigate = useSmoothNavigate();
    const goBack = () => navigate('/settings');

    const { register } = useKeyboardNav({ onBackspace: goBack });

    const [defaultPermission, setDefaultPermission] = useSettingValue(DefaultRemoteMicPermission);
    const remoteMics = useEventListenerSelector(events.inputListChanged, () => RemoteMicManager.getRemoteMics());

    const forceUpdate = useUpdate();
    useEffect(() => RemoteMicManager.addListener(forceUpdate), [forceUpdate]);

    return (
        <MenuWithLogo>
            <h1>Remote Microphone Settings</h1>
            <Switcher
                {...register('default-permission', () =>
                    setDefaultPermission(nextValue(RemoteMicPermissions, defaultPermission)),
                )}
                label="Default permission"
                info={
                    <>
                        <strong>WRITE</strong> - player is able to navigate the menus remotely and assign themselves and
                        other players to the game.
                        <br />
                        <br />
                        <strong>READ</strong> - player will only be able to use the device as a microphone and otherwise
                        have no control over the game.
                    </>
                }
                value={defaultPermission.toUpperCase()}
            />
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
