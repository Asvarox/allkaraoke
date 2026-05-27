import { ComponentProps, useState } from 'react';
import ExcludeLanguagesView from '~/routes/ExcludeLanguages/ExcludeLanguagesView';
import { ExcludedLanguagesSetting, useSettingValue } from '~/routes/Settings/SettingsState';
import SongSelection2 from '~/routes/SingASong/SongSelectionV2/SongSelection';

type SongSelectionProps = ComponentProps<typeof SongSelection2>;

function SingASong(props: SongSelectionProps) {
  const [excludedLanguages, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  const [languageSelection, setLanguageSelection] = useState(excludedLanguages === null);
  const SongSelectionComponent = SongSelection2;
  const goBack = () => {
    setExcludedLanguages(excludedLanguages ?? []);
    setLanguageSelection(false);
  };

  return languageSelection ? (
    <ExcludeLanguagesView onClose={goBack} closeText="Continue to Song Selection" />
  ) : (
    <SongSelectionComponent {...props} />
  );
}

export default SingASong;
