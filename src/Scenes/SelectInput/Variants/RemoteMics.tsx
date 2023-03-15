import ConnectRemoteMic from 'Scenes/ConnectRemoteMic/ConnectRemoteMic';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { MenuButton } from 'Elements/Menu';
import { useEffect } from 'react';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { useEventListenerSelector } from 'GameEvents/hooks';
import InputSources from 'Scenes/SelectInput/InputSources';
import { useRemoteMicAutoselect } from 'Scenes/SelectInput/hooks/useRemoteMicAutoselect';
import MicCheck from 'Scenes/SelectInput/MicCheck';
import events from 'GameEvents/GameEvents';

interface Props {
    onSetupComplete: (complete: boolean) => void;
    onBack: () => void;
    onSave: () => void;
    closeButtonText: string;
}

function RemoteMics(props: Props) {
    const { register } = useKeyboardNav({ onBackspace: props.onBack });

    useEffect(() => {
        InputManager.startMonitoring();
        return () => {
            InputManager.stopMonitoring();
        };
    }, []);
    useRemoteMicAutoselect();

    const players = useEventListenerSelector(
        // Subscribing to inputListChanged otherwise as it's InputManager.getInputs returns dummy input as the input
        // list is not yet updated with the connected remote mic.
        // The event sequence is wrongly remoteMicConnected -> playerInputChanged -> inputListChanged - needs to be fixed
        // e.g. remove remoteMicConnected event?
        [events.inputListChanged, events.playerInputChanged],
        () => {
            return InputManager.getInputs()
                .map((input) => (input.inputSource === 'Remote Microphone' ? input : null))
                .map((input) => (input ? InputSources.getInputForPlayerSelected(input) : null));
        },
    );

    const onContinue = () => {
        props.onSave();
    };

    const isComplete = !!players[0]?.label && !!players[1]?.label;

    useEffect(() => {
        props.onSetupComplete(isComplete);
    }, [isComplete]);

    return (
        <>
            <ConnectRemoteMic />
            <h4>You can connect multiple phones in advance.</h4>

            <h4>You will be able to connect phones later.</h4>
            <MicCheck names={[players[0]?.label ?? '...', players[1]?.label ?? '...']} />
            <MenuButton {...register('back', props.onBack)} data-test="back-button">
                Back
            </MenuButton>
            <MenuButton {...register('Sing a song', onContinue, undefined, true)} data-test="save-button">
                {props.closeButtonText}
            </MenuButton>
        </>
    );
}

export default RemoteMics;
