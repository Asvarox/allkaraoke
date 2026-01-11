import { twc } from 'react-twc';
import { Menu } from '~/modules/Elements/AKUI/Menu';
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
          <span className="ph-no-capture typography text-lg">{player.getName()} Input</span>
          <Menu.HelpText>(click to change)</Menu.HelpText>
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
        <PlayerMicCheck playerNumber={player.number} className="m-[2.5px] !h-[calc(100%-5px)] w-1/2 opacity-75" />
      </SwitcherWithMicCheck>
    </>
  );
};

const SwitcherWithMicCheck = twc(Switcher)`relative`;

const SwitcherWithPlayerHeader = twc(Switcher)`bg-none`;

const Header = twc.div`flex items-end justify-between`;
export default PlayerSelector;
