import { ComponentProps, useState } from 'react';
import { FeatureFlags } from '~/modules/utils/featureFlags';
import useFeatureFlag from '~/modules/utils/useFeatureFlag';
import ExcludeLanguagesView from '~/routes/ExcludeLanguages/ExcludeLanguagesView';
import { ExcludedLanguagesSetting, useSettingValue } from '~/routes/Settings/SettingsState';
import SongSelection from '~/routes/SingASong/SongSelection/SongSelection';
import SongSelection2 from '~/routes/SingASong/SongSelectionV2/SongSelection';

type SongSelectionProps = ComponentProps<typeof SongSelection> & ComponentProps<typeof SongSelection2>;

function SingASong(props: SongSelectionProps) {
  const [excludedLanguages, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  const [languageSelection, setLanguageSelection] = useState(excludedLanguages === null);
  const isSongSelection2Enabled = useFeatureFlag(FeatureFlags.SongSelection2);
  const SongSelectionComponent = isSongSelection2Enabled ? SongSelection2 : SongSelection;
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
