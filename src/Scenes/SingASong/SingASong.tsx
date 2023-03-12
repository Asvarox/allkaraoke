import LayoutWithBackground from 'Elements/LayoutWithBackground';
import ExcludeLanguagesView from 'Scenes/ExcludeLanguages/ExcludeLanguagesView';
import { ExcludedLanguagesSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import { ComponentProps, useState } from 'react';
import SongSelection from 'Scenes/SingASong/SongSelection/SongSelection';

function SingASong(props: ComponentProps<typeof SongSelection>) {
    const [excludedLanguages, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
    const [languageSelection, setLanguageSelection] = useState(excludedLanguages === null);
    const goBack = () => {
        setExcludedLanguages(excludedLanguages ?? []);
        setLanguageSelection(false);
    };

    return languageSelection ? (
        <LayoutWithBackground>
            <ExcludeLanguagesView onClose={goBack} closeText="Continue to Song Selection" />
        </LayoutWithBackground>
    ) : (
        <SongSelection {...props} />
    );
}

export default SingASong;
