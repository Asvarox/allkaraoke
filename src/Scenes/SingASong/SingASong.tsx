import ExcludeLanguagesView from 'Scenes/ExcludeLanguages/ExcludeLanguagesView';
import { ExcludedLanguagesSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import SongSelection from 'Scenes/SingASong/SongSelection/SongSelection';
import VirtualizedSongSelection from 'Scenes/SingASong/SongSelectionVirtualized/SongSelection';
import { useFeatureFlagEnabled } from 'posthog-js/react';
import { ComponentProps, useState } from 'react';
import { FeatureFlags } from 'utils/featureFlags';
import isE2E from 'utils/isE2E';

function SingASong(props: ComponentProps<typeof SongSelection>) {
  const isVirtualizedSongListEnabled = useFeatureFlagEnabled(FeatureFlags.VirtualizedSongSelection) || isE2E();
  const [excludedLanguages, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  const [languageSelection, setLanguageSelection] = useState(excludedLanguages === null);
  const goBack = () => {
    setExcludedLanguages(excludedLanguages ?? []);
    setLanguageSelection(false);
  };

  return languageSelection ? (
    <ExcludeLanguagesView onClose={goBack} closeText="Continue to Song Selection" />
  ) : isVirtualizedSongListEnabled ? (
    <VirtualizedSongSelection {...props} />
  ) : (
    <SongSelection {...props} />
  );
}

export default SingASong;
