import { ComponentProps, useState } from 'react';
import ExcludeLanguagesView from '~/routes/ExcludeLanguages/ExcludeLanguagesView';
import { ExcludedLanguagesSetting, useSettingValue } from '~/routes/Settings/SettingsState';
import SongSelection from '~/routes/SingASong/SongSelection/SongSelection';

type SongSelectionProps = ComponentProps<typeof SongSelection>;

function SingASong(props: SongSelectionProps) {
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
