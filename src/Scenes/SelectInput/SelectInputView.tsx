import { useState } from 'react';
import SelectPreference from 'Scenes/SelectInput/SelectPreference/SelectPreference';
import RemoteMics from 'Scenes/SelectInput/Variants/RemoteMics';
import { MicSetupPreference, MicSetupPreferenceSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import SingStarMics from 'Scenes/SelectInput/Variants/SingStarMics';
import Skip from 'Scenes/SelectInput/Variants/Skip';
import Advanced from 'Scenes/SelectInput/Variants/Advanced';

interface Props {
    onFinish: (pref: typeof MicSetupPreference[number]) => void;
    closeButtonText: string;
    playerNames?: string[];
}

function SelectInputView({ onFinish, closeButtonText, playerNames }: Props) {
    const [preference, setPreference] = useState<typeof MicSetupPreference[number]>(null);

    const [storedPreference, setStoredPreference] = useSettingValue(MicSetupPreferenceSetting);

    const onSave = (pref: typeof MicSetupPreference[number]) => () => {
        // Keep currently selected preference unless nothing (null) is selected - then store `skip` directly
        // skip is needed to mark that user explicitly didn't select anything
        setStoredPreference(pref === 'skip' ? storedPreference ?? 'skip' : pref);

        onFinish(pref);
    };
    const back = () => setPreference(null);

    return (
        <>
            <h1>How do you want to sing?</h1>
            <hr />
            {preference === null && <SelectPreference onPreferenceSelected={setPreference} />}
            {preference === 'remoteMics' && (
                <RemoteMics onBack={back} onSave={onSave('remoteMics')} closeButtonText={closeButtonText} />
            )}
            {preference === 'mics' && (
                <SingStarMics onBack={back} onSave={onSave('mics')} closeButtonText={closeButtonText} />
            )}
            {preference === 'advanced' && (
                <Advanced
                    onSave={onSave('advanced')}
                    onBack={back}
                    closeButtonText={closeButtonText}
                    playerNames={playerNames}
                />
            )}
            {preference === 'skip' && <Skip onBack={back} onSave={onSave('skip')} closeButtonText={closeButtonText} />}
        </>
    );
}

export default SelectInputView;
