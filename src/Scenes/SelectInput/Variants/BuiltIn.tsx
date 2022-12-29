import useKeyboardNav from 'hooks/useKeyboardNav';
import { MenuButton } from 'Elements/Menu';
import { useEffect, useState } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { useEventEffect } from 'Scenes/Game/Singing/Hooks/useEventListener';
import GameStateEvents from 'Scenes/Game/Singing/GameState/GameStateEvents';
import MicCheck from 'Scenes/SelectInput/MicCheck';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import UserMediaEnabled from 'UserMedia/UserMediaEnabled';

interface Props {
    onSetupComplete: (complete: boolean) => void;
    onBack: () => void;
    onSave: () => void;
    closeButtonText: string;
}

function BuiltIn(props: Props) {
    const { register } = useKeyboardNav({ onBackspace: props.onBack });
    const [selectedMic, setSelectedMic] = useState('');

    useEffect(() => {
        InputManager.startMonitoring();
        return () => {
            InputManager.stopMonitoring();
        };
    }, []);

    const { Microphone } = useMicrophoneList(true);

    const autoselect = () => {
        const defaultDevice = Microphone.getDefault();
        console.log(defaultDevice);
        if (defaultDevice) {
            [0, 1].forEach((playerNumber) =>
                InputManager.setPlayerInput(
                    playerNumber,
                    MicrophoneInputSource.inputName,
                    defaultDevice.channel,
                    defaultDevice.deviceId,
                ),
            );
            setSelectedMic(defaultDevice.label);
        }
    };

    useEffect(autoselect, []);
    useEventEffect(GameStateEvents.inputListChanged, autoselect);

    useEffect(() => {
        props.onSetupComplete(!!selectedMic);
    }, [selectedMic]);

    return (
        <>
            <UserMediaEnabled
                fallback={<h2>Please allow access to the microphone so the default one can be selected.</h2>}>
                {!selectedMic && <h4>The default device is being selected.</h4>}
                {selectedMic && (
                    <h4>
                        You'll sing using <strong data-test="selected-mic">{selectedMic}</strong>.
                    </h4>
                )}

                <h4>
                    You can change the device in <strong>Advanced</strong> section in the previous menu.
                </h4>
                <MicCheck names={['These light up when', 'singing is detected']} />
            </UserMediaEnabled>
            <MenuButton {...register('back', props.onBack)} data-test="back-button">
                Back
            </MenuButton>
            <MenuButton {...register('Sing a song', props.onSave, undefined, true)} data-test="save-button">
                {props.closeButtonText}
            </MenuButton>
        </>
    );
}

export default BuiltIn;
