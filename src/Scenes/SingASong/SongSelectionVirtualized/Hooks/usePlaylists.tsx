import styled from '@emotion/styled';
import { ClosableTooltip } from 'Elements/Tooltip';
import { useLanguageList } from 'Scenes/ExcludeLanguages/ExcludeLanguagesView';
import { colorSets } from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import eurovisionIcon from 'Scenes/SingASong/SongSelectionVirtualized/Components/SongCard/eurovision-icon.svg';
import { AppliedFilters } from 'Scenes/SingASong/SongSelectionVirtualized/Hooks/useSongList';
import { SongPreview } from 'interfaces';
import posthog from 'posthog-js';
import { ReactElement, ReactNode, useMemo } from 'react';
import { FeatureFlags } from 'utils/featureFlags';
import useFeatureFlag from 'utils/useFeatureFlag';

export interface PlaylistEntry {
  name: string;
  display?: ReactNode;
  Wrapper?: (props: { children: ReactElement; focused: boolean; active: boolean }) => ReactNode;
  filters: AppliedFilters;
  groupingFn?: (song: SongPreview) => string;
  sortingFn?: (a: SongPreview, b: SongPreview) => number;
}

const getEurovisionYear = (song: SongPreview) => {
  return song.edition?.toLowerCase().replace('esc ', '')?.trim() ?? undefined;
};

export const usePlaylists = (songs: SongPreview[], recommended: string[], isLoading: boolean): PlaylistEntry[] => {
  const songLanguages = useLanguageList(songs);
  const isEurovisionEnabled = useFeatureFlag(FeatureFlags.Eurovision);

  return useMemo<PlaylistEntry[]>(() => {
    if (isLoading) return [];

    const selectionOnTop =
      (posthog.getFeatureFlag(FeatureFlags.SelectionOnTop) ?? 'selection-on-top') === 'selection-on-top';
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
      selectionOnTop ? selection : all,
      isEurovisionEnabled
        ? {
            name: 'Eurovision',
            display: (
              <EurovisionDisplay>
                Euro
                <EurovisionLogo src={eurovisionIcon} alt="Eurovision logo" />
                ision
              </EurovisionDisplay>
            ),
            filters: { edition: 'esc' },
            groupingFn: (song) => {
              const year = getEurovisionYear(song);
              if (year) {
                const decade = Math.floor(+year / 10) * 10;
                return `${decade} - ${Math.min(decade + 9, new Date().getFullYear())}`;
              }
              return 'Other';
            },
            sortingFn: (a, b) => {
              const yearA = getEurovisionYear(a);
              const yearB = getEurovisionYear(b);
              if (yearA && yearB) {
                return +yearB - +yearA;
              }
              return 0;
            },
          }
        : null,
      selectionOnTop ? all : selection,
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

const EurovisionDisplay = styled.span`
  background-image: linear-gradient(
    90deg,
    ${colorSets.eurovisionPink.text},
    ${colorSets.eurovisionViolet.text},
    ${colorSets.eurovisionPink.text},
    ${colorSets.eurovisionBlue.text},
    ${colorSets.eurovisionPink.text}
  );

  background-size: 200% 200%;
  background-clip: text;
  color: transparent;
  display: flex;
  align-items: center;
    animation: playlist-gradient 15s linear infinite;
    

    @keyframes playlist-gradient {
        0% {
            background-position: 0% 0%;
        }
        100% {
            background-position: 400% 400%;
        }
`;

const EurovisionLogo = styled.img`
  width: 1em;
  height: 1em;
  animation: heartbeat 1.5s infinite;

  @keyframes heartbeat {
    0% {
      transform: scale(0.85);
    }
    10% {
      transform: scale(1);
    }
    20% {
      transform: scale(0.85);
    }
    30% {
      transform: scale(1);
    }
    40% {
      transform: scale(0.85);
    }
    100% {
      transform: scale(0.85);
    }
  }
`;
