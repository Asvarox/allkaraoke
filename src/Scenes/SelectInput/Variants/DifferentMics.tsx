import { MenuButton } from 'Elements/Menu';
import events from 'GameEvents/GameEvents';
import { useEventListenerSelector } from 'GameEvents/hooks';
import PlayersManager from 'Players/PlayersManager';
import { PlayerSelector } from 'Scenes/SelectInput/Variants/Components/PlayerSelector';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import usePlayerNumberPreset from 'Scenes/SelectInput/hooks/usePlayerNumberPreset';
import { MicSetupPreference } from 'Scenes/Settings/SettingsState';
import UserMediaEnabled from 'UserMedia/UserMediaEnabled';
import { useMicrophoneStatus } from 'UserMedia/hooks';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { useEffect } from 'react';
import { ValuesType } from 'utility-types';

interface Props {
  onSetupComplete: (complete: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  closeButtonText: string;
  changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
}

function DifferentMics(props: Props) {
  usePlayerNumberPreset(2);
  const inputs = useMicrophoneList(true, 'Microphone');
  const status = useMicrophoneStatus();

  useEffect(() => {
    props.onSetupComplete(status === 'accepted');
  }, [status]);

  useEffect(() => {
    PlayersManager.getPlayers().forEach((player) => {
      if (player.input.source !== 'Microphone') {
        player.changeInput('Microphone', 0);
      }
    });
  }, []);

  const { register } = useKeyboardNav({ onBackspace: props.onBack });

  const players = useEventListenerSelector(
    [events.inputListChanged, events.playerInputChanged, events.playerRemoved],
    () => PlayersManager.getPlayers(),
  );

  return (
    <>
      <UserMediaEnabled fallback={<h2>Please allow access to the microphone so we can show them.</h2>}>
        {players.map((player, index) => (
          <PlayerSelector
            inputs={inputs}
            player={player}
            key={player.number}
            register={register}
            readonly={index > 1}
            blockSourceChange
          />
        ))}
        <hr />
      </UserMediaEnabled>
      <MenuButton {...register('back-button', props.onBack)}>Change Input Type</MenuButton>
      <MenuButton {...register('save-button', props.onSave)}>{props.closeButtonText}</MenuButton>
    </>
  );
}

export default DifferentMics;
