import { ComponentProps } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Menu } from '~/modules/Elements/AKUI/Menu';
import useKeyboardHelp from '~/modules/hooks/useKeyboardHelp';
import { HelpEntry } from '~/routes/KeyboardHelp/Context';
import { InputLagSetting, useSettingValue } from '~/routes/Settings/SettingsState';

interface Props extends ComponentProps<typeof Menu.ButtonGroup> {
  focused: boolean;
}

const help: HelpEntry = {
  vertical: null,
  horizontal: 'Adjust input lag',
};

const InputLag = ({ onClick, focused, ...restProps }: Props) => {
  const [inputLag, setInputLag] = useSettingValue(InputLagSetting);

  useKeyboardHelp(help, focused);
  useHotkeys('left', () => setInputLag(inputLag - 50), { enabled: focused }, [inputLag]);
  useHotkeys('right', () => setInputLag(inputLag + 50), { enabled: focused }, [inputLag]);

  return (
    <Menu.ButtonGroup {...restProps}>
      <Menu.Button onClick={() => setInputLag(inputLag - 50)} className="aspect-square" focused={focused}>
        ←
      </Menu.Button>
      <Menu.Button readOnly className="flex-1" data-test="input-lag-value" data-value={inputLag}>
        {inputLag} ms
      </Menu.Button>
      <Menu.Button onClick={() => setInputLag(inputLag + 50)} className="aspect-square" focused={focused}>
        →
      </Menu.Button>
    </Menu.ButtonGroup>
  );
};

export default InputLag;
