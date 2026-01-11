import { ComponentProps, useState } from 'react';
import ExcludeLanguagesView from '~/routes/ExcludeLanguages/ExcludeLanguagesView';
import { ExcludedLanguagesSetting, useSettingValue } from '~/routes/Settings/SettingsState';
import VirtualizedSongSelection from '~/routes/SingASong/SongSelection/SongSelection';

function SingASong(props: ComponentProps<typeof VirtualizedSongSelection>) {
  const [excludedLanguages, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  const [languageSelection, setLanguageSelection] = useState(excludedLanguages === null);
  const goBack = () => {
    setExcludedLanguages(excludedLanguages ?? []);
    setLanguageSelection(false);
  };

  return languageSelection ? (
    <ExcludeLanguagesView onClose={goBack} closeText="Continue to Song Selection" />
  ) : (
    <VirtualizedSongSelection {...props} />
  );
}

export default SingASong;
