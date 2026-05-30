import { SongPreview } from '~/interfaces';
import { ClosableTooltip } from '~/modules/elements/tooltip';
// import isoCodeToCountry from '~/modules/utils/iso-code-to-country';
// import eurovisionIcon from '~/routes/sing-a-song/song-selection/components/song-card/eurovision-icon.svg';
import { List } from '@mui/icons-material';
import { ReactElement, ReactNode, useMemo } from 'react';
import Typography from '~/modules/elements/akui/primitives/typography';
import useRemoteMicServerStatus from '~/modules/remote-mic/hooks/use-remote-mic-server-status';
import { useLanguageList } from '~/modules/songs/hooks/use-language-list';
import useRemoteMicSongList from '~/modules/songs/hooks/use-remote-mic-song-list';
import { useSetlist } from '~/modules/songs/hooks/use-setlist';
import { FeatureFlags } from '~/modules/utils/feature-flags';
import useFeatureFlag from '~/modules/utils/use-feature-flag';
import { eurovisionPlaylist } from '~/routes/sing-a-song/song-selection/hooks/use-playlists-eurovision';
import { SongGroup } from '~/routes/sing-a-song/song-selection/hooks/use-song-list';
import { AppliedFilters } from '~/routes/sing-a-song/song-selection/hooks/use-song-list-filter';

export const LANGUAGE_PLAYLIST_PREFIX = 'language-';

export interface PlaylistEntry {
  name: string;
  display?: ReactNode;
  hideNew?: boolean;
  /** True when this entry opens the language picker sheet rather than directly activating a playlist. */
  isLanguagePicker?: boolean;
  Wrapper?: (props: { children: ReactElement; focused: boolean; active: boolean }) => ReactNode;
  filters: AppliedFilters;
  groupData?: (song: SongPreview) => Pick<SongGroup, 'name' | 'displayShort' | 'displayLong'>;
  postGrouping?: (groups: SongGroup[]) => SongGroup[];
  sortingFn?: (a: SongPreview, b: SongPreview) => number;
  footerComponent?: ReactNode;
}

export const usePlaylists = (
  songs: SongPreview[],
  recommended: string[],
  isLoading: boolean,
  extraLanguage: string | null,
): PlaylistEntry[] => {
  const { isSetlistInPlace } = useSetlist();
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
          <strong>★</strong>&nbsp;Selection
        </span>
      ),
      filters: {
        specificSongs: recommended,
      },
    };

    const all: PlaylistEntry = { name: 'All', filters: {} };
    const playlists: Array<PlaylistEntry | null> = [
      !isSetlistInPlace ? selection : null, // makes "all" playlist the first one if a setlist is loaded
      all,
      !isSetlistInPlace && isSpecialThemeEnabled ? eurovisionPlaylist : null,
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
      !isSetlistInPlace
        ? {
            name: 'New',
            filters: { recentlyUpdated: true },
          }
        : null,
      connected.length > 0
        ? {
            name: 'remote-mics',
            display: <>From &nbsp;Phones</>,
            filters: { specificSongs: remoteSongList, skipExcludedLanguages: true },
            footerComponent: (
              <div data-test="remote-mic-playlist-tip" className="flex justify-center">
                <Typography className="text-xl">
                  Add songs on your <strong>phone</strong> using{' '}
                  <strong>
                    <List className="text-[1em]!" /> Song List
                  </strong>{' '}
                  tab on the bottom of the screen
                </Typography>
              </div>
            ),
          }
        : null,
      // If the user has previously picked a language via the picker, show that language as the active entry.
      // Otherwise, show the "More languages" placeholder that will open the picker.
      extraLanguage !== null
        ? ({
            name: `${LANGUAGE_PLAYLIST_PREFIX}${extraLanguage}`,
            display: extraLanguage,
            isLanguagePicker: true,
            filters: { language: extraLanguage, skipExcludedLanguages: true },
          } as PlaylistEntry)
        : ({
            name: 'more-languages',
            display: '🌐 More languages',
            isLanguagePicker: true,
            // Empty filters are a safe fallback — the playlist name 'more-languages' is never persisted
            // because clicking it opens the language picker instead of activating it directly.
            filters: {},
          } as PlaylistEntry),
    ];

    return playlists.filter((playlist): playlist is PlaylistEntry => playlist !== null);
  }, [
    songLanguages,
    isLoading,
    recommended,
    remoteSongList,
    connected.length,
    isSetlistInPlace,
    isSpecialThemeEnabled,
    extraLanguage,
  ]);
};
