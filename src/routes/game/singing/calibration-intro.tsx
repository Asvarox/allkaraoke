import { Menu } from '~/modules/elements/akui/menu';
import { NavButton } from '~/modules/elements/nav-controls';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';

type Props = {
  onContinue: () => void;
};

export const CalibrationIntro = ({ onContinue }: Props) => {
  const { register } = useKeyboardNav({
    onBackspace: onContinue,
    title: 'Calibration',
  });

  return (
    <KeyboardNavContext value={register}>
      <Menu.Header>Calibration</Menu.Header>
      <Menu.HelpText>Before you sing, ensure the sound is synchronized with video.</Menu.HelpText>
      <Menu.HelpText>
        You can adjust the synchronization in <strong>Pause Menu</strong> later.
      </Menu.HelpText>
      <NavButton name="continue" onClick={onContinue}>
        Continue
      </NavButton>
    </KeyboardNavContext>
  );
};
