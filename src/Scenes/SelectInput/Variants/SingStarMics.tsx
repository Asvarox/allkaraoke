import useKeyboardNav from 'hooks/useKeyboardNav';
import { MenuButton } from 'Elements/Menu';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import { useEventEffect, useEventListenerSelector } from 'GameEvents/hooks';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { useEffect, useState } from 'react';
import MicCheck from 'Scenes/SelectInput/MicCheck';
import InputSources from 'Scenes/SelectInput/InputSources';
import UserMediaEnabled from 'UserMedia/UserMediaEnabled';
import isWindows from 'utils/isWindows';
import events from 'GameEvents/GameEvents';
import { MicSetupPreference } from 'Scenes/Settings/SettingsState';
import { ValuesType } from 'utility-types';
import isChromium from 'utils/isChromium';

interface Props {
    onSetupComplete: (complete: boolean) => void;
    onBack: () => void;
    onSave: () => void;
    closeButtonText: string;
    changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
}

function SingStarMics(props: Props) {
    const { register } = useKeyboardNav({ onBackspace: props.onBack });
    const { Microphone } = useMicrophoneList(true);
    const [showAdvancedTip, setShowAdvancedTip] = useState(false);

    const isSetup = useEventListenerSelector([events.playerInputChanged, events.inputListChanged], () => {
        const inputs = InputManager.getInputs();

        const isSameDeviceId = [...new Set(inputs.map((input) => input.deviceId))].length === 1;
        const isMicInput = !inputs.find((input) => input.inputSource !== 'Microphone');
        const areAllPreferred = !inputs.find(
            (input) => InputSources.getInputForPlayerSelected(input)!.preferred === undefined,
        );

        return isSameDeviceId && isMicInput && areAllPreferred;
    });

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
    useEventEffect(events.inputListChanged, () => {
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
            <UserMediaEnabled fallback={<h2>Please allow access to the microphone so we can find SingStar ones.</h2>}>
                {!isSetup && (
                    <>
                        <h3>Connect your SingStar microphones.</h3>
                        <h4 data-test="setup-not-completed">Make sure you only connect one pair.</h4>
                        {showAdvancedTip && (
                            <>
                                <h4 data-test="advanced-tip">
                                    If detection doesn't happen, try{' '}
                                    <button onClick={() => props.changePreference('advanced')}>Advanced</button> section
                                    in the previous menu.
                                </h4>
                                {isChromium() && isWindows() && (
                                    <h4>
                                        <strong>Chrome</strong> is known for not handling SingStar mics well. If you
                                        notice any problems, try using an alternative browser (eg.{' '}
                                        <strong>MS Edge</strong> or <strong>Firefox</strong>)
                                    </h4>
                                )}
                            </>
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
            </UserMediaEnabled>

            <MenuButton {...register('back', props.onBack)} data-test="back-button">
                Back to Input Selection
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

export default SingStarMics;
