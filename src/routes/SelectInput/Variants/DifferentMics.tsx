import { useEffect } from 'react';
import { ValuesType } from 'utility-types';
import { MenuButton } from '~/modules/Elements/Menu';
import events from '~/modules/GameEvents/GameEvents';
import { useEventListenerSelector } from '~/modules/GameEvents/hooks';
import PlayersManager from '~/modules/Players/PlayersManager';
import UserMediaEnabled from '~/modules/UserMedia/UserMediaEnabled';
import { useMicrophoneStatus } from '~/modules/UserMedia/hooks';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import { PlayerSelector } from '~/routes/SelectInput/Variants/Components/PlayerSelector';
import { useMicrophoneList } from '~/routes/SelectInput/hooks/useMicrophoneList';
import usePlayerNumberPreset from '~/routes/SelectInput/hooks/usePlayerNumberPreset';
import { MicSetupPreference } from '~/routes/Settings/SettingsState';

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
      <UserMediaEnabled
        fallback={
          <span className="typography text-lg">Please allow access to the microphone so we can show them.</span>
        }>
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
