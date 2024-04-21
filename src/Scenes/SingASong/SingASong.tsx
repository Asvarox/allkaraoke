import ExcludeLanguagesView from 'Scenes/ExcludeLanguages/ExcludeLanguagesView';
import { ExcludedLanguagesSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import VirtualizedSongSelection from 'Scenes/SingASong/SongSelectionVirtualized/SongSelection';
import { ComponentProps, useState } from 'react';

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
