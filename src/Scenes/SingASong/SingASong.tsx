import ExcludeLanguagesView from 'Scenes/ExcludeLanguages/ExcludeLanguagesView';
import { ExcludedLanguagesSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import SongSelection from 'Scenes/SingASong/SongSelection/SongSelection';
import { ComponentProps, useState } from 'react';

function SingASong(props: ComponentProps<typeof SongSelection>) {
    const [excludedLanguages, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
    const [languageSelection, setLanguageSelection] = useState(excludedLanguages === null);
    const goBack = () => {
        setExcludedLanguages(excludedLanguages ?? []);
        setLanguageSelection(false);
    };

    return languageSelection ? (
        <ExcludeLanguagesView onClose={goBack} closeText="Continue to Song Selection" />
    ) : (
        <SongSelection {...props} />
    );
}

export default SingASong;
