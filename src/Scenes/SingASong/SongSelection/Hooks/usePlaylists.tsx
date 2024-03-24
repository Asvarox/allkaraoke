import { ClosableTooltip } from 'Elements/Tooltip';
import { useLanguageList } from 'Scenes/ExcludeLanguages/ExcludeLanguagesView';
import { AppliedFilters } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import { SongPreview } from 'interfaces';
import { ReactElement, ReactNode, useMemo } from 'react';

export interface PlaylistEntry {
  name: string;
  display?: ReactNode;
  Wrapper?: (props: { children: ReactElement; focused: boolean; active: boolean }) => ReactNode;
  filters: AppliedFilters;
}

export const usePlaylists = (songs: SongPreview[], recommended: string[], isLoading: boolean): PlaylistEntry[] => {
  const songLanguages = useLanguageList(songs);
  return useMemo<PlaylistEntry[]>(() => {
    const playlists: Array<PlaylistEntry | null> = isLoading
      ? []
      : [
          {
            name: 'Selection',
            Wrapper: ({ children, active, focused }) => (
              <ClosableTooltip
                {...(active && focused ? { open: true } : {})}
                oneTime={false}
                timeoutMs={15_000}
                dismissKey="selection-playlist"
                placement={'right'}
                title={
                  <>
                    A combination of songs you might like and popular with other players.
                    <br />
                    <br /> <strong>Search</strong> is performed across all the songs.
                  </>
                }>
                {children}
              </ClosableTooltip>
            ),
            display: (
              <span>
                <strong>★</strong>&nbsp;Selection&nbsp;<strong>★</strong>
              </span>
            ),
            filters: {
              specificSongs: recommended,
            },
          },
          { name: 'All', filters: {} },
          // {
          //   name: 'Christmas',
          //   display: (
          //     <>
          //       <span style={{ color: colorSets.christmasRed.text }}>Chris</span>
          //       <span style={{ color: colorSets.christmasGreen.text }}>tmas</span> 🎄
          //     </>
          //   ),
          //   filters: { edition: 'christmas' },
          // },
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
          { name: 'Oldies', filters: { yearBefore: 1995 } },
          { name: 'Duets', filters: { duet: true } },
          {
            name: 'New',
            filters: { recentlyUpdated: true },
          },
        ];

    return playlists.filter((playlist): playlist is PlaylistEntry => playlist !== null);
  }, [songLanguages, isLoading, recommended]);
};
