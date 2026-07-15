import { useEffect } from 'react';
import { ValuesType } from 'utility-types';

import { MenuButton } from '~/modules/elements/menu';
import events from '~/modules/game-events/game-events';
import { useEventListenerSelector } from '~/modules/game-events/hooks';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';
import PlayersManager from '~/modules/players/players-manager';
import { useMicrophoneStatus } from '~/modules/user-media/hooks';
import UserMediaEnabled from '~/modules/user-media/user-media-enabled';
import isChromium from '~/modules/utils/is-chromium';
import isWindows from '~/modules/utils/is-windows';
import ConnectRemoteMic from '~/routes/connect-remote-mic/connect-remote-mic';
import { useMicrophoneList } from '~/routes/select-input/hooks/use-microphone-list';
import usePlayerNumberPreset from '~/routes/select-input/hooks/use-player-number-preset';
import { useRemoteMicAutoselect } from '~/routes/select-input/hooks/use-remote-mic-autoselect';
import { MicrophoneInputSource } from '~/routes/select-input/input-sources/microphone';
import PlayerSelector from '~/routes/select-input/variants/components/player-selector';
import { MicSetupPreference } from '~/routes/settings/settings-state';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- report setup completion when mic permission status changes
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
