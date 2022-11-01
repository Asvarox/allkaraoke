import LayoutWithBackground from 'Elements/LayoutWithBackground';
import { MenuButton, MenuContainer } from 'Elements/Menu';
import { Switcher } from 'Elements/Switcher';
import { navigate } from 'hooks/useHashLocation';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { useRef } from 'react';
import ConnectPhone from 'Scenes/ConnectPhone/ConnectPhone';
import GameStateEvents from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventEffect } from 'Scenes/Game/Singing/Hooks/useEventListener';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import { usePlayerInput } from 'Scenes/SelectInput/hooks/usePlayerInput';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { RemoteMicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Remote';

interface Props {
    // file?: string;
}

function SelectInput(props: Props) {
    const { inputs, areInputsLoaded } = useMicrophoneList();

    const [p1Source, p1CycleSource, p1Input, p1CycleInput] = usePlayerInput(0, inputs);
    const [p2Source, p2CycleSource, p2Input, p2CycleInput] = usePlayerInput(1, inputs);

    const nextPlayerToAutoSwitch = useRef(0);
    useEventEffect(GameStateEvents.phoneConnected, ({ id }) => {
        InputManager.setPlayerInput(nextPlayerToAutoSwitch.current, RemoteMicrophoneInputSource.inputName, 0, id);
        nextPlayerToAutoSwitch.current = (nextPlayerToAutoSwitch.current + 1) % 2;
    });

    const goBack = () => navigate('/');

    const { register } = useKeyboardNav({ onBackspace: goBack });

    if (!areInputsLoaded) return <LayoutWithBackground>Loading available voice inputs...</LayoutWithBackground>;

    return (
        <LayoutWithBackground>
            <MenuContainer>
                <h1>Setup players</h1>
                <ConnectPhone />
                <h2>Player 1</h2>
                <Switcher
                    {...register('player 1 source', p1CycleSource)}
                    label="Source"
                    value={p1Source}
                    data-test="player-1-source"
                />
                <Switcher
                    {...register('player 1 input', p1CycleInput)}
                    label="Input"
                    value={p1Input?.label}
                    data-test="player-1-input"
                />
                <h2>Player 2</h2>
                <Switcher
                    {...register('player 2 source', p2CycleSource)}
                    label="Source"
                    value={p2Source}
                    data-test="player-2-source"
                />
                <Switcher
                    {...register('player 2 input', p2CycleInput)}
                    label="Input"
                    value={p2Input?.label}
                    data-test="player-2-input"
                />
                <hr />
                {p1Source === MicrophoneInputSource.inputName &&
                    p2Source === MicrophoneInputSource.inputName &&
                    p1Input?.deviceId !== p2Input?.deviceId && (
                        <h3 data-test="mic-mismatch-warning">
                            Using different microphone devices is not yet supported
                        </h3>
                    )}
                <MenuButton {...register('go back', goBack)} data-test="back-button">
                    Return To Main Menu
                </MenuButton>
            </MenuContainer>
        </LayoutWithBackground>
    );
}
export default SelectInput;
