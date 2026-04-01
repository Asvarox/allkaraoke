import { useEffect } from 'react';
import { ValuesType } from 'utility-types';
import { SongPreview } from '~/interfaces';
import { useBackground } from '~/modules/Elements/BackgroundContext';
import { backgroundTheme } from '~/modules/Elements/LayoutWithBackground';
import { FeatureFlags } from '~/modules/utils/featureFlags';
import useFeatureFlag from '~/modules/utils/useFeatureFlag';
import { BackgroundThemeSetting, useSettingValue } from '~/routes/Settings/SettingsState';

const useSpecialSongTheme = (
  songPreview: SongPreview,
  theme: backgroundTheme,
  checkFn: (song: SongPreview) => boolean,
) => {
  const [backgroundTheme, setBackgroundTheme] = useSettingValue(BackgroundThemeSetting);
  const isSpecialThemeSong = checkFn(songPreview);
  useBackground(true, isSpecialThemeSong ? theme : 'regular');

  useEffect(() => {
    if (isSpecialThemeSong) {
      setBackgroundTheme(theme);
    } else if (backgroundTheme === theme) {
      // Background is set to this special theme but the song is no longer special — reset to regular
      setBackgroundTheme('regular');
    }
  }, [isSpecialThemeSong, theme, backgroundTheme, setBackgroundTheme]);

  return isSpecialThemeSong;
};

export const useSpecialTheme = (
  songPreview: SongPreview,
  feature: ValuesType<typeof FeatureFlags>,
  check: (preview: SongPreview) => boolean,
  theme: backgroundTheme,
) => {
  const isSpecialThemeEnabled = useFeatureFlag(feature);
  useSpecialSongTheme(
    songPreview,
    isSpecialThemeEnabled ? theme : 'regular',
    isSpecialThemeEnabled ? check : () => false,
  );
};
