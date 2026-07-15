import { ComponentProps, useState } from 'react';

import ExcludeLanguagesView from '~/routes/exclude-languages/exclude-languages-view';
import { ExcludedLanguagesSetting, useSettingValue } from '~/routes/settings/settings-state';
import SongSelection from '~/routes/sing-a-song/song-selection/song-selection';

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
