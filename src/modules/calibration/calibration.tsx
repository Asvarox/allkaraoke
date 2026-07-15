import { useRef } from 'react';

import { CalibrationTool } from '~/modules/calibration/calibration-tool';
import { Menu } from '~/modules/elements/akui/menu';
import useKeyboardNav from '~/modules/hooks/use-keyboard-nav';

import InputLag from './input-lag';

type Props = {
  onSave: () => void;
  onClose?: () => void;
};

export const Calibration = ({ onClose, onSave }: Props) => {
  const inputLagRef = useRef<HTMLInputElement | null>(null);

  const { register } = useKeyboardNav({
    onBackspace: onClose,
  });

  return (
    <>
      <Menu.Header>Sync video with sound</Menu.Header>
      <Menu.HelpText>
        Make sure the <strong>circle</strong> appears at the same time as the <strong>click sound</strong>.
      </Menu.HelpText>
      <CalibrationTool />
      <Menu.HelpText>
        Click <strong>←</strong> if you hear the click <strong>before</strong> the circle.
      </Menu.HelpText>
      {}
      <InputLag ref={inputLagRef} {...register('input-lag', () => inputLagRef.current?.focus())} />
      <Menu.HelpText className="text-right">
        Click <strong>→</strong> if you hear the click <strong>after</strong> the circle.
      </Menu.HelpText>
      <Menu.Divider />
      <Menu.Button {...register('save', onSave)}>Looks good, play the song</Menu.Button>
    </>
  );
};
