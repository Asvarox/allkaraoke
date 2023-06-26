import useKeyboardNav from 'hooks/useKeyboardNav';
import { MenuButton } from 'Elements/Menu';
import { useEffect, useState } from 'react';
import MicCheck from 'Scenes/SelectInput/MicCheck';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import UserMediaEnabled from 'UserMedia/UserMediaEnabled';
import { nextIndex, Switcher } from 'Elements/Switcher';
import { InputSource } from '../InputSources/interfaces';
import { useEventEffect } from 'GameEvents/hooks';
import events from 'GameEvents/GameEvents';
import { MicSetupPreference } from 'Scenes/Settings/SettingsState';
import { ValuesType } from 'utility-types';
import styled from '@emotion/styled';
import PlayersManager from 'PlayersManager';

interface Props {
    onSetupComplete: (complete: boolean) => void;
    onBack: () => void;
    onSave: () => void;
    changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
    closeButtonText: string;
}

function BuiltIn(props: Props) {
    const { register } = useKeyboardNav({ onBackspace: props.onBack });
    const [selectedMic, setSelectedMic] = useState('');

    const { Microphone } = useMicrophoneList(true);

    const setMic = (input: InputSource) => {
        [0, 1].forEach((playerNumber) =>
            PlayersManager.getPlayer(playerNumber).changeInput(
                MicrophoneInputSource.inputName,
                input.channel,
                input.deviceId,
            ),
        );
        setSelectedMic(input.label);
    };

    const autoselect = () => {
        if (selectedMic === '') {
            const defaultDevice = Microphone.getDefault();
            console.log(defaultDevice);
            if (defaultDevice) {
                setMic(defaultDevice);
            }
        }
    };

    useEffect(autoselect, []);
    useEventEffect(events.inputListChanged, autoselect);

    const cycleMic = () => {
        const currentIndex = Microphone.list.findIndex((mic) => mic.label === selectedMic);

        if (currentIndex > -1) {
            const input = Microphone.list[nextIndex(Microphone.list, currentIndex)];
            setMic(input);
        }
    };

    useEffect(() => {
        props.onSetupComplete(!!selectedMic);
    }, [selectedMic]);

    return (
        <>
            <UserMediaEnabled
                fallback={<h2>Please allow access to the microphone so the default one can be selected.</h2>}>
                {!selectedMic && <h3>The default device is being selected.</h3>}
                {selectedMic && (
                    <>
                        <Header>
                            <h3>You'll sing using</h3>
                            <h4>(click to change)</h4>
                        </Header>
                        <Switcher {...register('selected-mic', cycleMic)} label="Mic" value={selectedMic} />
                        <h4>
                            Built-in microphones can pick up music from the game. For more accurate scores, try using
                            your{' '}
                            <button onClick={() => props.changePreference('remoteMics')}>
                                smartphone as a microphone
                            </button>
                            .
                        </h4>
                    </>
                )}
                <MicCheck names={['These light up when', 'singing is detected']} />
            </UserMediaEnabled>
            <MenuButton {...register('back-button', props.onBack)}>Back to Input Selection</MenuButton>
            <MenuButton
                {...register('save-button', props.onSave, undefined, true, { disabled: !selectedMic })}
                disabled={!selectedMic}>
                {props.closeButtonText}
            </MenuButton>
        </>
    );
}

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
`;

export default BuiltIn;
