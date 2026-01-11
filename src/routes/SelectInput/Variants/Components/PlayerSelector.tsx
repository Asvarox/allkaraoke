import styled from '@emotion/styled';
import { Switcher } from '~/modules/Elements/Switcher';
import { PlayerMicCheck } from '~/modules/Elements/VolumeIndicator';
import { PlayerEntity } from '~/modules/Players/PlayersManager';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import { useMicrophoneList } from '~/routes/SelectInput/hooks/useMicrophoneList';
import { usePlayerInput } from '~/routes/SelectInput/hooks/usePlayerInput';

interface Props {
  player: PlayerEntity;
  inputs: ReturnType<typeof useMicrophoneList>;
  register: ReturnType<typeof useKeyboardNav>['register'];
  readonly: boolean;
  blockSourceChange?: boolean;
}

export const PlayerSelector = (props: Props) => {
  const player = props.player;
  const [source, cycleSource, input, cycleInput] = usePlayerInput(player.number, props.inputs);

  return (
    <>
      {props.blockSourceChange ? (
        <Header>
          <h3 className="ph-no-capture">{player.getName()} Input</h3>
          <h4>(click to change)</h4>
        </Header>
      ) : (
        <SwitcherWithPlayerHeader
          {...(props.readonly ? {} : props.register(`player-${player.number}-source`, () => cycleSource()))}
          label={<span className="ph-no-capture">{player.getName()} Source</span>}
          value={source}
          disabled={props.readonly}
        />
      )}
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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;
export default PlayerSelector;
