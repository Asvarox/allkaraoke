import { useState } from 'react';
import SelectPreference from 'Scenes/SelectInput/SelectPreference/SelectPreference';
import RemoteMics from 'Scenes/SelectInput/Variants/RemoteMics';
import { MicSetupPreference, MicSetupPreferenceSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import SingStarMics from 'Scenes/SelectInput/Variants/SingStarMics';
import Skip from 'Scenes/SelectInput/Variants/Skip';
import Advanced from 'Scenes/SelectInput/Variants/Advanced';
import BuiltIn from 'Scenes/SelectInput/Variants/BuiltIn';
import posthog from 'posthog-js';
import startViewTransition from 'utils/startViewTransition';
import { CompletedAnim, Heading } from 'Elements/Menu/Heading';

interface Props {
    onFinish: (pref: (typeof MicSetupPreference)[number]) => void;
    onBack?: () => void;
    smooth?: boolean;
    closeButtonText: string;
    playerNames?: string[];
}

const LAST_SELECTED_KEY = 'Previously selected input type';

const previouslySelected = localStorage.getItem(LAST_SELECTED_KEY);

function SelectInputView({ onFinish, closeButtonText, playerNames, onBack, smooth }: Props) {
    const [preference, setPreference] = useState<(typeof MicSetupPreference)[number]>(null);
    const [isComplete, setIsComplete] = useState(false);

    const [storedPreference, setStoredPreference] = useSettingValue(MicSetupPreferenceSetting);

    const storePreference = (...args: Parameters<typeof setPreference>) => {
        startViewTransition(() => {
            setPreference(...args);
        });
    };

    const onSave = (pref: (typeof MicSetupPreference)[number]) => () => {
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
        startViewTransition(() => {
            setPreference(null);
            setIsComplete(false);
        });
    };

    return (
        <>
            <Heading>
                {isComplete ? (
                    <>
                        <CompletedAnim /> Setup completed!
                    </>
                ) : (
                    'How do you want to sing?'
                )}
            </Heading>
            {(preference === null || preference === 'skip') && (
                <SelectPreference
                    onPreferenceSelected={storePreference}
                    previouslySelected={previouslySelected}
                    onBack={onBack}
                />
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

export default SelectInputView;
