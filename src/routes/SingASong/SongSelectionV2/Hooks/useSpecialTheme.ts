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
    }
  }, []);

  useEffect(() => {
    if (backgroundTheme !== theme && isSpecialThemeSong) {
      setBackgroundTheme(theme);
    } else if (backgroundTheme === theme && !isSpecialThemeSong) {
      setBackgroundTheme('regular');
    }
  }, [theme, backgroundTheme, songPreview]);

  return isSpecialThemeSong;
};

export const useSpecialTheme = (
  songPreview: SongPreview,
  feature: ValuesType<typeof FeatureFlags>,
  check: (preview: SongPreview) => boolean,
  theme: backgroundTheme,
) => {
  const isSpecialThemeEnabled = useFeatureFlag(feature);
  const _isSpecialSong = useSpecialSongTheme(
    songPreview,
    isSpecialThemeEnabled ? theme : 'regular',
    isSpecialThemeEnabled ? check : () => false,
  );
};
