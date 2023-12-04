import { useLanguageList } from 'Scenes/ExcludeLanguages/ExcludeLanguagesView';
import { colorSets } from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { AppliedFilters } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import dayjs from 'dayjs';
import { SongPreview } from 'interfaces';
import { ReactNode, useMemo } from 'react';

export interface PlaylistEntry {
  name: string;
  display?: ReactNode;
  filters: AppliedFilters;
}

export const usePlaylists = (songs: SongPreview[]): PlaylistEntry[] => {
  const songLanguages = useLanguageList(songs);
  return useMemo(
    () =>
      [
        { name: 'All', filters: {} },
        {
          name: 'Christmas',
          display: (
            <>
              <span style={{ color: colorSets.christmasRed.text }}>Chris</span>
              <span style={{ color: colorSets.christmasGreen.text }}>tmas</span> 🎄
            </>
          ),
          filters: { edition: 'christmas' },
        },
        songLanguages[0]
          ? ({
              name: songLanguages[0].name,
              filters: { language: songLanguages[0].name },
            } as PlaylistEntry)
          : null,
        songLanguages[1]
          ? {
              name: songLanguages[1].name,
              filters: { language: songLanguages[1].name },
            }
          : null,
        // { name: "Classics", filters: { yearBefore: 1995 } },
        // { name: "Modern", filters: { yearAfter: 1995 } },
        { name: 'Duets', filters: { duet: true } },
        {
          name: 'New',
          filters: { updatedAfter: dayjs().subtract(31, 'days').toISOString() },
        },
      ].filter((playlist): playlist is PlaylistEntry => playlist !== null),
    [songLanguages],
  );
};
