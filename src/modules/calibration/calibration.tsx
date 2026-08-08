import { useRef } from 'react';

import { CalibrationTool } from '~/modules/calibration/calibration-tool';
import { Menu } from '~/modules/elements/akui/menu';
import { NavButton } from '~/modules/elements/nav-controls';
import useKeyboardNav, { KeyboardNavContext } from '~/modules/hooks/use-keyboard-nav';
import { InputLagSetting, useSettingValue } from '~/routes/settings/settings-state';

import InputLag from './input-lag';

type Props = {
  onSave: () => void;
  onClose?: () => void;
  /** What confirming actually leads to — the online wizard enters a room rather than starting a song. */
  saveLabel?: string;
};

// The three hint lines are rendered both by the screen itself and by `CalibrationLayoutReserve`
// below, so the height being reserved can't drift away from the words it's holding room for.
const CircleSyncHint = () => (
  <Menu.HelpText>
    Make sure the <strong>circle</strong> appears at the same time as the <strong>click sound</strong>.
  </Menu.HelpText>
);

const ClickBeforeHint = () => (
  <Menu.HelpText>
    Click <strong>←</strong> if you hear the click <strong>before</strong> the circle.
  </Menu.HelpText>
);

const ClickAfterHint = () => (
  <Menu.HelpText className="text-right">
    Click <strong>→</strong> if you hear the click <strong>after</strong> the circle.
  </Menu.HelpText>
);

/**
 * The height this screen fills between its header and its button — the three hint lines, the 150px
 * tool, the input-lag control and the divider — rendered invisibly, so a screen shown in its place
 * can hold that space open and have the real thing swapped in without anything moving (see
 * routes/game/singing/calibration-intro.tsx). It lives here rather than at the call site so the
 * hints are literally the same nodes and the stand-in heights sit next to the layout they measure.
 *
 * The tool and the input-lag control are plain spacers rather than the real components: rendering
 * those would start the calibration video and add a second focusable control. Their heights mirror
 * `CalibrationTool`'s `h-[150px]` container and the small-button row `InputLag` renders.
 *
 * The copy is held at normal weight so it wraps — and so measures — exactly as this reserver always
 * has; letting the emphasis through would re-wrap the lines and change the reserved height.
 *
 * Meant to be stacked with the content it makes room for in a `grid`, which is where the row and
 * column placement comes from.
 */
export const CalibrationLayoutReserve = () => (
  <div className="invisible col-start-1 row-start-1 flex flex-col gap-4 [&_strong]:font-normal" aria-hidden>
    <CircleSyncHint />
    <div className="h-[150px]" />
    <ClickBeforeHint />
    <div className="h-[50px]" />
    <ClickAfterHint />
    <Menu.Divider />
  </div>
);

export const Calibration = ({ onClose, onSave, saveLabel = 'Looks good, play the song' }: Props) => {
  const inputLagRef = useRef<HTMLInputElement | null>(null);
  const [inputLag] = useSettingValue(InputLagSetting);

  const { register } = useKeyboardNav({
    onBackspace: onClose,
    title: 'Sync video with sound',
  });

  return (
    <KeyboardNavContext value={register}>
      <Menu.Header>Sync video with sound</Menu.Header>
      <CircleSyncHint />
      <CalibrationTool />
      <ClickBeforeHint />
      <InputLag
        ref={inputLagRef}
        {...register('input-lag', () => inputLagRef.current?.focus(), 'Input lag', false, {
          control: { type: 'input-lag', label: 'Input lag', value: inputLag },
        })}
      />
      <ClickAfterHint />
      <Menu.Divider />
      <NavButton name="save" onClick={onSave}>
        {saveLabel}
      </NavButton>
    </KeyboardNavContext>
  );
};
