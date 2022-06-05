import { MenuButton, MenuContainer } from 'Elements/Menu';
import { navigate } from 'hooks/useHashLocation';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import { usePlayerInput } from 'Scenes/SelectInput/hooks/usePlayerInput';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { Switcher } from '../Game/SongSelection/Switcher';

interface Props {
    // file?: string;
}

function SelectInput(props: Props) {
    const { inputs, areInputsLoaded } = useMicrophoneList();

    const [p1Source, p1CycleSource, p1Input, p1CycleInput] = usePlayerInput(0, inputs, areInputsLoaded);
    const [p2Source, p2CycleSource, p2Input, p2CycleInput] = usePlayerInput(1, inputs, areInputsLoaded);

    const goBack = () => navigate('/');

    const { register } = useKeyboardNav({ onBackspace: goBack });

    if (!areInputsLoaded) return <>Loading available voice inputs...</>;

    return (
        <MenuContainer>
            <h1>Setup players</h1>
            <h2>Player 1</h2>
            <Switcher {...register('player 1 source', p1CycleSource)} label="Source" value={p1Source} />
            <Switcher {...register('player 1 input', p1CycleInput)} label="Input" value={p1Input?.label} />
            <h2>Player 2</h2>
            <Switcher {...register('player 2 source', p2CycleSource)} label="Source" value={p2Source} />
            <Switcher {...register('player 2 input', p2CycleInput)} label="Input" value={p2Input?.label} />
            <hr />
            {p1Source === MicrophoneInputSource.inputName &&
                p2Source === MicrophoneInputSource.inputName &&
                p1Input.deviceId !== p2Input.deviceId && (
                    <h3>Using different microphone devices is not yet supported</h3>
                )}
            <MenuButton {...register('go back', goBack)}>Return To Main Menu</MenuButton>
        </MenuContainer>
    );
}
export default SelectInput;
