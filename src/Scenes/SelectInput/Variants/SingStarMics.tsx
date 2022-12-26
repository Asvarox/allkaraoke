import useKeyboardNav from 'hooks/useKeyboardNav';
import { MenuButton } from 'Elements/Menu';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import { useEventEffect, useEventListenerSelector } from 'Scenes/Game/Singing/Hooks/useEventListener';
import GameStateEvents from 'Scenes/Game/Singing/GameState/GameStateEvents';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { useEffect, useState } from 'react';
import MicCheck from 'Scenes/SelectInput/MicCheck';
import InputSources from 'Scenes/SelectInput/InputSources';
import styled from '@emotion/styled';

interface Props {
    onSetupComplete: (complete: boolean) => void;
    onBack: () => void;
    onSave: () => void;
    closeButtonText: string;
}

function SingStarMics(props: Props) {
    const { register } = useKeyboardNav({ onBackspace: props.onBack });
    const { Microphone } = useMicrophoneList(true);
    const [showAdvancedTip, setShowAdvancedTip] = useState(false);

    const isSetup = useEventListenerSelector(
        [GameStateEvents.playerInputChanged, GameStateEvents.inputListChanged],
        () => {
            const inputs = InputManager.getInputs();

            const isSameDeviceId = [...new Set(inputs.map((input) => input.deviceId))].length === 1;
            const isMicInput = !inputs.find((input) => input.inputSource !== 'Microphone');
            const areAllPreferred = !inputs.find(
                (input) => InputSources.getInputForPlayerSelected(input)!.preferred === undefined,
            );

            return isSameDeviceId && isMicInput && areAllPreferred;
        },
    );

    useEffect(() => {
        if (isSetup) {
            InputManager.startMonitoring();
        }
        return () => {
            InputManager.stopMonitoring();
        };
    }, [isSetup]);

    const onContinue = () => {
        props.onSave();
    };

    // Look for proper microphones in the list when the list changes
    useEventEffect(GameStateEvents.inputListChanged, () => {
        const preferred = Microphone.list.filter((input) => input.preferred !== undefined);
        if (preferred.length === 2 && preferred[0].deviceId === preferred[1].deviceId) {
            preferred.forEach((input) => {
                InputManager.setPlayerInput(
                    input.preferred!,
                    MicrophoneInputSource.inputName,
                    input.channel,
                    input.deviceId,
                );
            });
        }
    });

    useEffect(() => {
        props.onSetupComplete(isSetup);
    }, [isSetup]);

    useEffect(() => {
        if (isSetup) {
            setShowAdvancedTip(false);
        } else {
            const timeout = setTimeout(() => setShowAdvancedTip(true), 2500);

            return () => clearTimeout(timeout);
        }
    }, [isSetup]);

    return (
        <>
            {!isSetup && (
                <>
                    <h3>Connect your SingStar microphones.</h3>
                    <h4 data-test="setup-not-completed">Make sure you only connect one pair.</h4>
                    {showAdvancedTip && (
                        <h4 data-test="advanced-tip">
                            If detection doesn't happen, try{' '}
                            <AdvancedLink onClick={props.onBack}>Advanced</AdvancedLink> section in the previous menu.
                        </h4>
                    )}
                </>
            )}
            {isSetup && (
                <>
                    <h2 data-test="setup-completed">
                        <strong>SingStar</strong> microphone connected!
                    </h2>

                    <MicCheck names={['Blue', 'Red']} />
                </>
            )}

            <MenuButton {...register('back', props.onBack)} data-test="back-button">
                Back
            </MenuButton>
            <MenuButton
                {...(isSetup ? register('Sing a song', onContinue, undefined, true) : {})}
                disabled={!isSetup}
                data-test="save-button">
                {props.closeButtonText}
            </MenuButton>
        </>
    );
}

const AdvancedLink = styled.strong`
    cursor: pointer;
`;

export default SingStarMics;
