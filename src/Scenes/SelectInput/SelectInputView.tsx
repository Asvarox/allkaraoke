import { useState } from 'react';
import SelectPreference from 'Scenes/SelectInput/SelectPreference/SelectPreference';
import RemoteMics from 'Scenes/SelectInput/Variants/RemoteMics';
import { MicSetupPreference, MicSetupPreferenceSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import SingStarMics from 'Scenes/SelectInput/Variants/SingStarMics';
import Skip from 'Scenes/SelectInput/Variants/Skip';
import Advanced from 'Scenes/SelectInput/Variants/Advanced';
import BuiltIn from 'Scenes/SelectInput/Variants/BuiltIn';
import completedAnimation from './completed-animation.json';
import Lottie from 'lottie-react';
import styled from '@emotion/styled';
import tuple from 'utils/tuple';
import posthog from 'posthog-js';

interface Props {
    onFinish: (pref: typeof MicSetupPreference[number]) => void;
    closeButtonText: string;
    playerNames?: string[];
}

// needs to be a "stable" array - reference can't change
const completedAnimationSegment = tuple([0, 50]);

const LAST_SELECTED_KEY = 'Previously selected input type';

const previouslySelected = localStorage.getItem(LAST_SELECTED_KEY);

function SelectInputView({ onFinish, closeButtonText, playerNames }: Props) {
    const [preference, setPreference] = useState<typeof MicSetupPreference[number]>(null);
    const [isComplete, setIsComplete] = useState(false);

    const [storedPreference, setStoredPreference] = useSettingValue(MicSetupPreferenceSetting);

    const onSave = (pref: typeof MicSetupPreference[number]) => () => {
        // Keep currently selected preference unless nothing (null) is selected - then store `skip` directly
        // skip is needed to mark that user explicitly didn't select anything
        setStoredPreference(pref === 'skip' ? storedPreference ?? 'skip' : pref);
        if (pref) {
            localStorage.setItem(LAST_SELECTED_KEY, pref);
            posthog.capture('sourcePreferenceSet', { source: pref });
        }

        onFinish(pref);
    };
    const back = () => {
        setPreference(null);
        setIsComplete(false);
    };

    return (
        <>
            <Heading>
                {isComplete ? (
                    <>
                        <CompletedAnim
                            initialSegment={completedAnimationSegment}
                            animationData={completedAnimation}
                            loop={false}
                        />{' '}
                        Setup completed!
                    </>
                ) : (
                    'How do you want to sing?'
                )}
            </Heading>
            {preference === null && (
                <SelectPreference onPreferenceSelected={setPreference} previouslySelected={previouslySelected} />
            )}
            {preference === 'remoteMics' && (
                <RemoteMics
                    onSetupComplete={setIsComplete}
                    onBack={back}
                    onSave={onSave('remoteMics')}
                    closeButtonText={closeButtonText}
                />
            )}
            {preference === 'mics' && (
                <SingStarMics
                    onSetupComplete={setIsComplete}
                    onBack={back}
                    onSave={onSave('mics')}
                    closeButtonText={closeButtonText}
                />
            )}
            {preference === 'built-in' && (
                <BuiltIn
                    onSetupComplete={setIsComplete}
                    onBack={back}
                    onSave={onSave('built-in')}
                    closeButtonText={closeButtonText}
                />
            )}
            {preference === 'advanced' && (
                <Advanced
                    onSave={onSave('advanced')}
                    onSetupComplete={setIsComplete}
                    onBack={back}
                    closeButtonText={closeButtonText}
                    playerNames={playerNames}
                />
            )}
            {preference === 'skip' && (
                <Skip
                    onSetupComplete={setIsComplete}
                    onBack={back}
                    onSave={onSave('skip')}
                    closeButtonText={closeButtonText}
                />
            )}
        </>
    );
}

const Heading = styled.h1`
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
`;

const CompletedAnim = styled(Lottie)`
    display: inline-block;
    width: 10rem;
    height: 10rem;
    margin: -3rem -2rem -3rem -3rem;
`;

export default SelectInputView;
