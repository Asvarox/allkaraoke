import { styled } from '@linaria/react';
import { SongPreview } from 'interfaces';
import { Flag } from 'modules/Elements/Flag';
import { colorSets } from 'modules/GameEngine/Drawing/styles';
import isoCodeToCountry from 'modules/utils/isoCodeToCountry';
import eurovisionIcon from 'routes/SingASong/SongSelection/Components/SongCard/eurovision-icon.svg';
import { PlaylistEntry } from 'routes/SingASong/SongSelection/Hooks/usePlaylists';

const getEurovisionYear = (song: SongPreview) => {
  return song.edition?.toLowerCase().replace('esc ', '')?.trim() ?? undefined;
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

export const eurovisionPlaylist: PlaylistEntry = {
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
};
