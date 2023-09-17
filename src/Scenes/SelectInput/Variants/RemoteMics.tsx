import { MenuButton } from 'Elements/Menu';
import events from 'GameEvents/GameEvents';
import { useEventListenerSelector } from 'GameEvents/hooks';
import PlayersManager from 'Players/PlayersManager';
import ConnectRemoteMic from 'Scenes/ConnectRemoteMic/ConnectRemoteMic';
import InputSources from 'Scenes/SelectInput/InputSources';
import MicCheck from 'Scenes/SelectInput/MicCheck';
import usePlayerNumberPreset from 'Scenes/SelectInput/hooks/usePlayerNumberPreset';
import { useRemoteMicAutoselect } from 'Scenes/SelectInput/hooks/useRemoteMicAutoselect';
import { MicSetupPreference } from 'Scenes/Settings/SettingsState';
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

function RemoteMics(props: Props) {
  usePlayerNumberPreset(2);
  const { register } = useKeyboardNav({ onBackspace: props.onBack });

  useRemoteMicAutoselect();

  const players = useEventListenerSelector(
    // Subscribing to inputListChanged otherwise as it's InputManager.getInputs returns dummy input as the input
    // list is not yet updated with the connected remote mic.
    // The event sequence is wrongly remoteMicConnected -> playerInputChanged -> inputListChanged - needs to be fixed
    // e.g. remove remoteMicConnected event?
    [events.inputListChanged, events.playerInputChanged],
    () => {
      return PlayersManager.getInputs()
        .map((input) => (input.source === 'Remote Microphone' ? input : null))
        .map((input) => (input ? InputSources.getInputForPlayerSelected(input) : null));
    },
  );

  const onContinue = () => {
    props.onSave();
  };

  const isComplete = !!players[0]?.label && !!players[1]?.label;

  useEffect(() => {
    props.onSetupComplete(isComplete);
  }, [isComplete]);

  return (
    <>
      <ConnectRemoteMic />
      <h4>You can connect multiple phones in advance.</h4>
      <h4>You will be able to connect phones later.</h4>
      <MicCheck />
      <MenuButton {...register('back-button', props.onBack)}>Change Input Type</MenuButton>
      <MenuButton {...register('save-button', onContinue, undefined, true)}>{props.closeButtonText}</MenuButton>
    </>
  );
}

export default RemoteMics;
