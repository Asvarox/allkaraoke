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
          screen fills it with — its two hint lines, the 150px tool, the input-lag control and the
          divider — so Continue swaps the tool in without moving anything. Mirrors
          modules/calibration/calibration.tsx; keep the two in step. The intro's own text then sits
          centred in that space rather than clinging to the top of it. */}
      <div className="grid">
        <div className="invisible col-start-1 row-start-1 flex flex-col gap-4" aria-hidden>
          <Menu.HelpText>Make sure the circle appears at the same time as the click sound.</Menu.HelpText>
          <div className="h-[150px]" />
          <Menu.HelpText>Click ← if you hear the click before the circle.</Menu.HelpText>
          <div className="h-[50px]" />
          <Menu.HelpText>Click → if you hear the click after the circle.</Menu.HelpText>
          <Menu.Divider />
        </div>
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
