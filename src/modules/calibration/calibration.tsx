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
};

export const Calibration = ({ onClose, onSave }: Props) => {
  const inputLagRef = useRef<HTMLInputElement | null>(null);
  const [inputLag] = useSettingValue(InputLagSetting);

  const { register } = useKeyboardNav({
    onBackspace: onClose,
    title: 'Sync video with sound',
  });

  return (
    <KeyboardNavContext value={register}>
      <Menu.Header>Sync video with sound</Menu.Header>
      <Menu.HelpText>
        Make sure the <strong>circle</strong> appears at the same time as the <strong>click sound</strong>.
      </Menu.HelpText>
      <CalibrationTool />
      <Menu.HelpText>
        Click <strong>←</strong> if you hear the click <strong>before</strong> the circle.
      </Menu.HelpText>
      {}
      <InputLag
        ref={inputLagRef}
        {...register('input-lag', () => inputLagRef.current?.focus(), 'Input lag', false, {
          control: { type: 'input-lag', label: 'Input lag', value: inputLag },
        })}
      />
      <Menu.HelpText className="text-right">
        Click <strong>→</strong> if you hear the click <strong>after</strong> the circle.
      </Menu.HelpText>
      <Menu.Divider />
      <NavButton name="save" onClick={onSave}>
        Looks good, play the song
      </NavButton>
    </KeyboardNavContext>
  );
};
