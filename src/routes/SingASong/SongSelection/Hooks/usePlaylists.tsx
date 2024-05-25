import styled from '@emotion/styled';
import { SongPreview } from 'interfaces';
import { Flag } from 'modules/Elements/Flag';
import { ClosableTooltip } from 'modules/Elements/Tooltip';
import { colorSets } from 'modules/GameEngine/Drawing/styles';
import { FeatureFlags } from 'modules/utils/featureFlags';
import isoCodeToCountry from 'modules/utils/isoCodeToCountry';
import useFeatureFlag from 'modules/utils/useFeatureFlag';
import { ReactElement, ReactNode, useMemo } from 'react';
import { useLanguageList } from 'routes/ExcludeLanguages/ExcludeLanguagesView';
import eurovisionIcon from 'routes/SingASong/SongSelection/Components/SongCard/eurovision-icon.svg';
import { AppliedFilters, SongGroup } from 'routes/SingASong/SongSelection/Hooks/useSongList';

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

const getEurovisionYear = (song: SongPreview) => {
  return song.edition?.toLowerCase().replace('esc ', '')?.trim() ?? undefined;
};

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    // @ts-ignore
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

export const usePlaylists = (songs: SongPreview[], recommended: string[], isLoading: boolean): PlaylistEntry[] => {
  const songLanguages = useLanguageList(songs);
  const isEurovisionEnabled = useFeatureFlag(FeatureFlags.Eurovision);

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
            hideNew: true,
            groupData: (song) => {
              const flag = song.artistOrigin ? <SFlag isocode={song.artistOrigin} /> : 'Other';
              return {
                name: song.artistOrigin ?? 'Other',
                displayLong: song.artistOrigin ? (
                  <>
                    {flag} {isoCodeToCountry(song.artistOrigin)}
                  </>
                ) : (
                  'Other'
                ),
                displayShort: flag,
              };
            },
            sortingFn: (a, b) => {
              const yearA = getEurovisionYear(a);
              const yearB = getEurovisionYear(b);
              if (yearA && yearB) {
                return +yearB - +yearA;
              }
              return 0;
            },
            postGrouping: (groups) => {
              let finalGroups = groups;
              // group single item groups into "Other"
              const singleItemGroups = groups.filter((group) => group.songs.length <= 1);
              if (singleItemGroups.length) {
                let other = groups.find((group) => group.name === 'Other');
                if (!other) {
                  other = { name: 'Other', songs: [] };
                  groups.push(other);
                }
                other.displayLong = (
                  <>
                    <SFlag isocode="eu" /> Other
                  </>
                );
                other.songs = singleItemGroups.map((group) => group.songs[0]);
                finalGroups = groups.filter((group) => group.songs.length > 1);
              }
              // sort by country name
              finalGroups.sort((a, b) => {
                if (a.name === 'Other') return 1;
                if (b.name === 'Other') return -1;
                return (
                  isoCodeToCountry(a.songs[0].song.artistOrigin!)?.localeCompare(
                    isoCodeToCountry(b.songs[0].song.artistOrigin!) ?? '',
                  ) ?? 0
                );
              });

              return finalGroups;
            },
          }
        : null,

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
      !isEurovisionEnabled ? { name: 'Modern', filters: { yearAfter: 1995 } } : null,
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

const SFlag = styled(Flag)`
  width: 1em;
  object-fit: contain;
`;
