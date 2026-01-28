import styled from '@emotion/styled';
import { ComponentRef, Ref, useImperativeHandle, useRef } from 'react';
import { Input } from '~/modules/Elements/Input';
import { InputLagSetting, useSettingValue } from '~/routes/Settings/SettingsState';

interface Props {
  focused: boolean;
  ref?: Ref<ComponentRef<typeof Input>>;
}

const InputLag = ({ ref, ...restProps }: Props) => {
  const inputRef = useRef<ComponentRef<typeof Input>>(null);
  useImperativeHandle(ref, () => inputRef.current!);
  const [inputLag, setInputLag] = useSettingValue(InputLagSetting);

  return (
    <InputLagField
      ref={inputRef}
      label="Input lag"
      value={String(inputLag)}
      onChange={(val) => setInputLag(+val)}
      type="number"
      step={50}
      min={-2000}
      max={2000}
      adornment={'ms'}
      onKeyDown={(e) => {
        if (e.code === 'Enter') {
          inputRef.current?.element?.blur();
        }
      }}
      info="If the sound is not synchronised with the lyrics, use this to compensate it."
      {...restProps}
    />
  );
};

const InputLagField = styled(Input)`
  input {
    text-align: right;
  }
`;

export default InputLag;
