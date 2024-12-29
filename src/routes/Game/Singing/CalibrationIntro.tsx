import { Menu } from 'modules/Elements/AKUI/Menu';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';

type Props = {
  onContinue: () => void;
};

export const CalibrationIntro = ({ onContinue }: Props) => {
  const { register } = useKeyboardNav({
    onBackspace: onContinue,
  });

  return (
    <>
      <Menu.Header>Calibration</Menu.Header>
      <Menu.HelpText>Before you sing, ensure the sound is synchronized with video.</Menu.HelpText>
      <Menu.HelpText>
        You can adjust the synchronization in <strong>Pause Menu</strong> later.
      </Menu.HelpText>
      <Menu.Button {...register('continue', onContinue)}>Continue</Menu.Button>
    </>
  );
};
