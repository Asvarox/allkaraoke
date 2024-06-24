import { SongPreview } from 'interfaces';
import { ClosableTooltip } from 'modules/Elements/Tooltip';
// import { FeatureFlags } from 'modules/utils/featureFlags';
// import isoCodeToCountry from 'modules/utils/isoCodeToCountry';
// import eurovisionIcon from 'routes/SingASong/SongSelection/Components/SongCard/eurovision-icon.svg';
import { ReactElement, ReactNode, useMemo } from 'react';
import { useLanguageList } from 'routes/ExcludeLanguages/ExcludeLanguagesView';
import { SongGroup } from 'routes/SingASong/SongSelection/Hooks/useSongList';
import { AppliedFilters } from 'routes/SingASong/SongSelection/Hooks/useSongListFilter';

export interface PlaylistEntry {
  name: string;
  display?: ReactNode;
  hideNew?: boolean;
  Wrapper?: (props: { children: ReactElement; focused: boolean; active: boolean }) => ReactNode;
  filters: AppliedFilters;
  groupData?: (song: SongPreview) => Pick<SongGroup, 'name' | 'displayShort' | 'displayLong'>;
  postGrouping?: (groups: SongGroup[]) => SongGroup[];
  sortingFn?: (a: SongPreview, b: SongPreview) => number;
}

export const usePlaylists = (songs: SongPreview[], recommended: string[], isLoading: boolean): PlaylistEntry[] => {
  const songLanguages = useLanguageList(songs);

  return useMemo<PlaylistEntry[]>(() => {
    if (isLoading) return [];

    const selection: PlaylistEntry = {
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
    };

    const all: PlaylistEntry = { name: 'All', filters: {} };
    const playlists: Array<PlaylistEntry | null> = [
      selection,
      all,
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
      { name: 'Modern', filters: { yearAfter: 1995 } },
      { name: 'Duets', filters: { duet: true } },
      {
        name: 'New',
        filters: { recentlyUpdated: true },
      },
    ];

    return playlists.filter((playlist): playlist is PlaylistEntry => playlist !== null);
  }, [songLanguages, isLoading, recommended]);
};
