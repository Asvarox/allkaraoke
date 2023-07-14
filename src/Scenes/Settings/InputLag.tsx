import styled from '@emotion/styled';
import { Input } from 'Elements/Input';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { InputLagSetting, useSettingValue } from 'Scenes/Settings/SettingsState';

interface Props {
    focused: boolean;
}

const InputLag = forwardRef<HTMLInputElement, Props>(({ ...restProps }, forwardedRef) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(forwardedRef, () => inputRef.current!);
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
                    inputRef.current?.blur();
                }
            }}
            info="If the sound is not synchorised with the lyrics, use this to compensate it."
            {...restProps}
        />
    );
});

const InputLagField = styled(Input)`
    input {
        text-align: right;
    }
`;

export default InputLag;
