import { useEffect } from 'react';
import { ValuesType } from 'utility-types';
import { MenuButton } from '~/modules/elements/menu';
import events from '~/modules/game-events/game-events';
import { useEventListenerSelector } from '~/modules/game-events/hooks';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import PlayersManager from '~/modules/players/players-manager';
import { useMicrophoneStatus } from '~/modules/user-media/hooks';
import UserMediaEnabled from '~/modules/user-media/user-media-enabled';
import { useMicrophoneList } from '~/routes/select-input/hooks/use-microphone-list';
import usePlayerNumberPreset from '~/routes/select-input/hooks/use-player-number-preset';
import { PlayerSelector } from '~/routes/select-input/variants/components/player-selector';
import { MicSetupPreference } from '~/routes/settings/settings-state';

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
