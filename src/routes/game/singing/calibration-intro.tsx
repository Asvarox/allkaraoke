import { CalibrationLayoutReserve } from '~/modules/calibration/calibration';
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
      {/* The block between the header and the button is held at exactly the height the calibration
          screen fills it with, so Continue swaps the tool in without moving anything. The reserver
          is exported by modules/calibration/calibration.tsx, so the screen being measured owns the
          measurement and the two can't fall out of step. The intro's own text then sits centred in
          that space rather than clinging to the top of it. */}
      <div className="grid">
        <CalibrationLayoutReserve />
        <div className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-4 text-center">
          <Menu.HelpText>Before you sing, ensure the sound is synchronized with video.</Menu.HelpText>
          <Menu.HelpText>
            You can adjust the synchronization in <strong>Pause Menu</strong> later.
          </Menu.HelpText>
        </div>
      </div>
      <NavButton name="continue" onClick={onContinue}>
        Continue
      </NavButton>
    </KeyboardNavContext>
  );
};
