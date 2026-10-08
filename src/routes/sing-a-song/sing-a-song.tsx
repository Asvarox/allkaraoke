import { ComponentProps, useEffect, useState } from 'react';

import PageLoader from '~/modules/elements/page-loader';
import {
  getDefaultExcludedLanguages,
  useSelectableLanguages,
} from '~/routes/exclude-languages/default-excluded-languages';
import ExcludeLanguagesView from '~/routes/exclude-languages/exclude-languages-view';
import { ExcludedLanguagesSetting, useSettingValue } from '~/routes/settings/settings-state';
import SongSelection from '~/routes/sing-a-song/song-selection/song-selection';

type SongSelectionProps = ComponentProps<typeof SongSelection>;

function SingASong(props: SongSelectionProps) {
  const [excludedLanguages, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  // Arriving for a specific song (e.g. picked on the landing page) skips the first-run language ask
  const [languageSelection, setLanguageSelection] = useState(excludedLanguages === null && !props.preselectedSong);
  const goBack = () => {
    setExcludedLanguages(excludedLanguages ?? []);
    setLanguageSelection(false);
  };

  if (languageSelection) {
    return <ExcludeLanguagesView onClose={goBack} closeText="Continue to Song Selection" />;
  }
  if (excludedLanguages === null) {
    return <ApplyDefaultExcludedLanguages />;
  }
  return <SongSelection {...props} />;
}

/** Commits the selection the language screen would have proposed, without showing it. */
function ApplyDefaultExcludedLanguages() {
  const [, setExcludedLanguages] = useSettingValue(ExcludedLanguagesSetting);
  const { languageList, isLoading } = useSelectableLanguages();

  useEffect(() => {
    if (!isLoading) setExcludedLanguages(getDefaultExcludedLanguages(languageList));
  }, [isLoading, languageList, setExcludedLanguages]);

  return <PageLoader />;
}

export default SingASong;
