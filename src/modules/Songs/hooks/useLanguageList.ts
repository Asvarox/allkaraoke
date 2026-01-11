import { useMemo } from 'react';
import { SongPreview } from '~/interfaces';

export const useLanguageList = (list: Pick<SongPreview, 'language'>[]) => {
  return useMemo(() => {
    const langs: Record<string, { name: string; count: number }> = {};

    list.forEach((song) => {
      if (!song.language) return;
      const songLangs = Array.isArray(song.language) ? song.language : [song.language];

      songLangs.forEach((lang) => {
        const langId = lang.toLowerCase();
        if (!langs[langId]) {
          langs[langId] = { name: lang, count: 0 };
        }
        langs[langId].count = langs[langId].count + 1;
      });
    });

    const languages = Object.values(langs);
    languages.sort((a, b) => b.count - a.count);

    return languages;
  }, [list]);
};
