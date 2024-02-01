import styled from '@emotion/styled';
import { MenuButton } from 'Elements/Menu';
import { Switcher } from 'Elements/Switcher';
import { PlayerMicCheck } from 'Elements/VolumeIndicator';
import events from 'GameEvents/GameEvents';
import { useEventListenerSelector } from 'GameEvents/hooks';
import PlayersManager, { PlayerEntity } from 'Players/PlayersManager';
import ConnectRemoteMic from 'Scenes/ConnectRemoteMic/ConnectRemoteMic';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import { usePlayerInput } from 'Scenes/SelectInput/hooks/usePlayerInput';
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

const PlayerSelector = (props: {
  player: PlayerEntity;
  inputs: ReturnType<typeof useMicrophoneList>;
  register: ReturnType<typeof useKeyboardNav>['register'];
  readonly: boolean;
}) => {
  usePlayerNumberPreset(2);
  console.log(PlayersManager.getPlayers());
  const player = props.player;
  const [source, cycleSource, input, cycleInput] = usePlayerInput(player.number, props.inputs);
  return (
    <>
      <SwitcherWithPlayerHeader
        {...(props.readonly ? {} : props.register(`player-${player.number}-source`, cycleSource))}
        label={<span className="ph-no-capture">{player.getName()} Source</span>}
        value={source}
        disabled={props.readonly}
      />
      <SwitcherWithMicCheck
        {...(props.readonly ? {} : props.register(`player-${player.number}-input`, cycleInput))}
        label="Input"
        disabled={props.readonly}
        value={input?.label}>
        <MicCheck playerNumber={player.number} />
      </SwitcherWithMicCheck>
    </>
  );
};

interface Props {
  onSetupComplete: (complete: boolean) => void;
  onBack: () => void;
  onSave: () => void;
  closeButtonText: string;
  changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
}

function Advanced(props: Props) {
  const inputs = useMicrophoneList(true);
  const status = useMicrophoneStatus();

  useEffect(() => {
    props.onSetupComplete(status === 'accepted');
  }, [status]);

  useRemoteMicAutoselect();

  const { register } = useKeyboardNav({ onBackspace: props.onBack });

  const selectedInputs = useEventListenerSelector(events.playerInputChanged, () => PlayersManager.getInputs());

  const micInputs = selectedInputs.filter((input) => input.source === MicrophoneInputSource.inputName);
  const isDifferentMics = new Set(micInputs.map((input) => input.deviceId)).size > 1;

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
        {micInputs.length > 1 && isDifferentMics && (
          <h3 data-test="mic-mismatch-warning">Using different microphone devices is not yet supported</h3>
        )}
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

const MicCheck = styled(PlayerMicCheck)`
  opacity: 0.75;
  width: 50%;
  height: calc(100% - 0.5rem);
  margin: 0.25rem;
`;

const SwitcherWithMicCheck = styled(Switcher)`
  position: relative;
`;

const SwitcherWithPlayerHeader = styled(Switcher)`
  background: none;
`;

export default Advanced;
