import { useMemo } from 'react';

import { useLanguageList } from '~/modules/songs/hooks/use-language-list';
import useSongIndex from '~/modules/songs/hooks/use-song-index';
import isE2E from '~/modules/utils/is-e2-e';
import languageNameToIsoCode from '~/modules/utils/language-name-to-iso-code';

const MIN_SONGS_COUNT = isE2E() ? 0 : 20;

/** The languages offered for exclusion: the ones with a flag and enough songs to be worth a toggle. */
export function useSelectableLanguages() {
  const { data, isLoading } = useSongIndex();
  const availableLanguages = useLanguageList(data);
  const languageList = useMemo(
    () => availableLanguages.filter(({ name, count }) => languageNameToIsoCode(name) && count >= MIN_SONGS_COUNT),
    [availableLanguages],
  );

  return { availableLanguages, languageList, isLoading };
}

/** The first-run selection: every language the browser doesn't ask for is excluded, English always kept. */
export function getDefaultExcludedLanguages(languageList: Array<{ name: string }>) {
  if (!navigator?.languages) return [];

  const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
  const preferredLanguages = navigator.languages
    .map((lang) => languageNames.of(lang)?.toLowerCase())
    .filter(Boolean) as string[];

  return languageList
    .map((lang) => lang.name)
    .filter((lang) => !preferredLanguages.some((preferred) => preferred.includes(lang.toLowerCase())))
    .filter((lang) => lang !== 'English');
}
