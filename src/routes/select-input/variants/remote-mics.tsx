import { useEffect } from 'react';
import { ValuesType } from 'utility-types';
import { Menu } from '~/modules/elements/akui/menu';
import { MenuButton } from '~/modules/elements/menu';
import events from '~/modules/game-events/game-events';
import { useEventListenerSelector } from '~/modules/game-events/hooks';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import PlayersManager from '~/modules/players/players-manager';
import ConnectRemoteMic from '~/routes/connect-remote-mic/connect-remote-mic';
import usePlayerNumberPreset from '~/routes/select-input/hooks/use-player-number-preset';
import { useRemoteMicAutoselect } from '~/routes/select-input/hooks/use-remote-mic-autoselect';
import InputSources from '~/routes/select-input/input-sources/index';
import MicCheck from '~/routes/select-input/mic-check';
import { MicSetupPreference } from '~/routes/settings/settings-state';

interface Props {
  onSetupComplete: (complete: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  closeButtonText: string;
  changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
}

function RemoteMics(props: Props) {
  'use no memo'; // React Compiler: <MicCheck /> below is rendered with no props, so the compiler caches that element forever and MicCheck's own re-renders (driven by PlayersManager, a mutable singleton) never get triggered.
  usePlayerNumberPreset(2);
  const { register } = useKeyboardNav({ onBackspace: props.onBack });

  useRemoteMicAutoselect();

  const players = useEventListenerSelector(
    // Subscribing to inputListChanged otherwise as it's InputManager.getInputs returns dummy input as the input
    // list is not yet updated with the connected remote mic.
    // The event sequence is wrongly remoteMicConnected -> playerInputChanged -> inputListChanged - needs to be fixed
    // e.g. remove remoteMicConnected event?
    [events.inputListChanged, events.playerInputChanged, events.playerRemoved],
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
      <div className="flex flex-col gap-2">
        <Menu.HelpText>You can connect multiple phones in advance.</Menu.HelpText>
        <Menu.HelpText>You will be able to connect phones later.</Menu.HelpText>
      </div>
      <MicCheck />
      <MenuButton {...register('back-button', props.onBack)}>Change Input Type</MenuButton>
      <MenuButton {...register('save-button', onContinue, undefined, true)}>{props.closeButtonText}</MenuButton>
    </>
  );
}

export default RemoteMics;
