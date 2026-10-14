import { ComponentProps } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Input } from '~/modules/elements/input';
import { InputLagSetting, useSettingValue } from '~/routes/settings/settings-state';

interface Props extends Omit<Partial<ComponentProps<typeof Input>>, 'focused'> {
  focused: boolean;
}

/** The input-lag stepper: the value with its ← and → nudges held inside the field. */
const InputLag = ({ focused, ...restProps }: Props) => {
  const [inputLag, setInputLag] = useSettingValue(InputLagSetting);

  useHotkeys('left', () => setInputLag(inputLag - 50), { enabled: focused }, [inputLag]);
  useHotkeys('right', () => setInputLag(inputLag + 50), { enabled: focused }, [inputLag]);

  return (
    <Input
      label=""
      aria-label="Input lag"
      value={`${inputLag} ms`}
      onChange={() => undefined}
      readOnly
      className="[&_input]:text-center"
      data-value={inputLag}
      {...restProps}
      focused={focused}
      startAdornment={
        <Input.Button onClick={() => setInputLag(inputLag - 50)} className="mr-0 -ml-1 aspect-square">
          ←
        </Input.Button>
      }
      adornment={
        <Input.Button onClick={() => setInputLag(inputLag + 50)} className="aspect-square">
          →
        </Input.Button>
      }
    />
  );
};

export default InputLag;
