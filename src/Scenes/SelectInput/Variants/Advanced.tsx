import { MenuButton } from 'Elements/Menu';
import events from 'GameEvents/GameEvents';
import { useEventListenerSelector } from 'GameEvents/hooks';
import PlayersManager from 'Players/PlayersManager';
import ConnectRemoteMic from 'Scenes/ConnectRemoteMic/ConnectRemoteMic';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import PlayerSelector from 'Scenes/SelectInput/Variants/Components/PlayerSelector';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import usePlayerNumberPreset from 'Scenes/SelectInput/hooks/usePlayerNumberPreset';
import { useRemoteMicAutoselect } from 'Scenes/SelectInput/hooks/useRemoteMicAutoselect';
import { MicSetupPreference } from 'Scenes/Settings/SettingsState';
import UserMediaEnabled from 'UserMedia/UserMediaEnabled';
import { useMicrophoneStatus } from 'UserMedia/hooks';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { useEffect } from 'react';
import { ValuesType } from 'utility-types';
import isChromium from 'utils/isChromium';
import isWindows from 'utils/isWindows';

interface Props {
  onSetupComplete: (complete: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  closeButtonText: string;
  changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
}

function Advanced(props: Props) {
  usePlayerNumberPreset(2);
  const inputs = useMicrophoneList(true);
  const status = useMicrophoneStatus();

  useEffect(() => {
    props.onSetupComplete(status === 'accepted');
  }, [status]);

  useRemoteMicAutoselect();

  const { register } = useKeyboardNav({ onBackspace: props.onBack });

  const selectedInputs = useEventListenerSelector(events.playerInputChanged, () => PlayersManager.getInputs());

  const micInputs = selectedInputs.filter((input) => input.source === MicrophoneInputSource.inputName);

  const players = useEventListenerSelector(
    [events.inputListChanged, events.playerInputChanged, events.playerRemoved],
    () => PlayersManager.getPlayers(),
  );

  return (
    <>
      <UserMediaEnabled fallback={<h2>Please allow access to the microphone so we can show them.</h2>}>
        <ConnectRemoteMic />
        {players.map((player, index) => (
          <PlayerSelector
            inputs={inputs}
            player={player}
            key={player.number}
            register={register}
            readonly={index > 1}
          />
        ))}
        <hr />
        {micInputs.length > 1 && isChromium() && isWindows() && (
          <h3>
            <strong>Chrome</strong> is known for not handling SingStar mics well. If you notice any problems, try using
            an alternative browser (eg. <strong>MS Edge</strong> or <strong>Firefox</strong>)
          </h3>
        )}
      </UserMediaEnabled>
      <MenuButton {...register('back-button', props.onBack)}>Change Input Type</MenuButton>
      <MenuButton {...register('save-button', props.onSave)}>{props.closeButtonText}</MenuButton>
    </>
  );
}

export default Advanced;
