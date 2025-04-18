import { SongPreview } from 'interfaces';
import { ClosableTooltip } from 'modules/Elements/Tooltip';
// import isoCodeToCountry from 'modules/utils/isoCodeToCountry';
// import eurovisionIcon from 'routes/SingASong/SongSelection/Components/SongCard/eurovision-icon.svg';
import { List } from '@mui/icons-material';
import Text from 'modules/Elements/AKUI/Primitives/Text';
import useRemoteMicServerStatus from 'modules/RemoteMic/hooks/useRemoteMicServerStatus';
import useRemoteMicSongList from 'modules/Songs/hooks/useRemoteMicSongList';
import { FeatureFlags } from 'modules/utils/featureFlags';
import useFeatureFlag from 'modules/utils/useFeatureFlag';
import { ReactElement, ReactNode, useMemo } from 'react';
import { useLanguageList } from 'routes/ExcludeLanguages/ExcludeLanguagesView';
import { eurovisionPlaylist } from 'routes/SingASong/SongSelection/Hooks/usePlaylistsEurovision';
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
  footerComponent?: ReactNode;
}

export const usePlaylists = (songs: SongPreview[], recommended: string[], isLoading: boolean): PlaylistEntry[] => {
  const isSpecialThemeEnabled = useFeatureFlag(FeatureFlags.Eurovision);
  const songLanguages = useLanguageList(songs);
  const remoteSongList = useRemoteMicSongList();
  const { connected } = useRemoteMicServerStatus();

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
          place={'right'}
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
      isSpecialThemeEnabled ? eurovisionPlaylist : null,
      // {
      //   name: 'Halloween',
      //   display: (
      //     <>
      //       <span style={{ color: colorSets.halloweenViolet.text }}>Hallo</span>
      //       <span style={{ color: colorSets.halloweenOrange.text }}>ween</span> 🎃
      //     </>
      //   ),
      //   filters: { edition: 'halloween' },
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
      { name: 'Duets', filters: { duet: true } },
      {
        name: 'New',
        filters: { recentlyUpdated: true },
      },
      connected.length > 0
        ? {
            name: 'remote-mics',
            display: <>From &nbsp;Phones</>,
            filters: { specificSongs: remoteSongList, skipExcludedLanguages: true },
            footerComponent: (
              <div data-test="remote-mic-playlist-tip" className="flex justify-center">
                <Text className="text-xl">
                  Add songs on your <strong>phone</strong> using{' '}
                  <strong>
                    <List className="text-[1em]!" /> Song List
                  </strong>{' '}
                  tab on the bottom of the screen
                </Text>
              </div>
            ),
          }
        : null,
    ];

    return playlists.filter((playlist): playlist is PlaylistEntry => playlist !== null);
  }, [songLanguages, isLoading, recommended, remoteSongList, connected.length]);
};
