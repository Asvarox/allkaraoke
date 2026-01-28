import { useEffect } from 'react';
import { ValuesType } from 'utility-types';
import { MenuButton } from '~/modules/Elements/Menu';
import events from '~/modules/GameEvents/GameEvents';
import { useEventListenerSelector } from '~/modules/GameEvents/hooks';
import PlayersManager from '~/modules/Players/PlayersManager';
import UserMediaEnabled from '~/modules/UserMedia/UserMediaEnabled';
import { useMicrophoneStatus } from '~/modules/UserMedia/hooks';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import isChromium from '~/modules/utils/isChromium';
import isWindows from '~/modules/utils/isWindows';
import ConnectRemoteMic from '~/routes/ConnectRemoteMic/ConnectRemoteMic';
import { MicrophoneInputSource } from '~/routes/SelectInput/InputSources/Microphone';
import PlayerSelector from '~/routes/SelectInput/Variants/Components/PlayerSelector';
import { useMicrophoneList } from '~/routes/SelectInput/hooks/useMicrophoneList';
import usePlayerNumberPreset from '~/routes/SelectInput/hooks/usePlayerNumberPreset';
import { useRemoteMicAutoselect } from '~/routes/SelectInput/hooks/useRemoteMicAutoselect';
import { MicSetupPreference } from '~/routes/Settings/SettingsState';

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
      <UserMediaEnabled
        fallback={<div className="typography text-lg">Please allow access to the microphone so we can show them.</div>}>
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
