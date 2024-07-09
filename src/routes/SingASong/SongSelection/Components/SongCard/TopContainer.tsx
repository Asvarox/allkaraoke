import styled from '@emotion/styled';
import { FiberNewOutlined, Star } from '@mui/icons-material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import dayjs from 'dayjs';
import { SongPreview } from 'interfaces';
import styles from 'modules/GameEngine/Drawing/styles';
import { useSongStats } from 'modules/Songs/stats/hooks';
import { isEurovisionSong } from 'modules/Songs/utils/specialSongsThemeChecks';
import { ReactNode, useMemo } from 'react';
import eurovisionIcon from 'routes/SingASong/SongSelection/Components/SongCard/eurovision-icon.svg';

import { filteringFunctions } from 'routes/SingASong/SongSelection/Hooks/useSongListFilter';

export const TopContainer = (props: { song: SongPreview; isPopular: boolean; video?: ReactNode }) => {
  return (
    <SongCardTopRightContainer>
      {props.song.tracksCount > 1 && (
        <MultiTrackIndicator data-test="multitrack-indicator">
          <PeopleAltIcon />
          &nbsp; Duet
        </MultiTrackIndicator>
      )}
      <SongCardStatsIndicator song={props.song} isPopular={props.isPopular} focused={!!props.video} />
    </SongCardTopRightContainer>
  );
};

export const SongCardStatsIndicator = ({
  song,
  isPopular,
  focused,
}: {
  song: SongPreview;
  isPopular: boolean;
  focused: boolean;
}) => {
  const isRecentlyUpdated = useMemo(() => filteringFunctions.recentlyUpdated([song]).length > 0, [song]);
  const isESCSong = isEurovisionSong(song);

  const stats = useSongStats(song);
  const lastPlayed = stats?.scores?.at(-1)?.date ?? false;
  const playedToday = lastPlayed && dayjs(lastPlayed).isAfter(dayjs().subtract(1, 'days'));

  return stats?.plays ? (
    <SongIndicatorStat data-test="song-stat-indicator">
      {playedToday ? (
        'Played today'
      ) : (
        <>
          {focused ? (
            <>
              Played {stats.plays} time{stats.plays > 1 && 's'}
            </>
          ) : (
            stats.plays
          )}
        </>
      )}
    </SongIndicatorStat>
  ) : isESCSong ? (
    <SongIndicatorIcon white>
      {
        <SongIndicatorLabel>
          {focused ? song.edition?.replace('ESC', 'Eurovision') : song.edition?.replace('ESC ', '')}
        </SongIndicatorLabel>
      }
      <EurovisionIcon src={eurovisionIcon} alt={song.edition} />
    </SongIndicatorIcon>
  ) : isRecentlyUpdated ? (
    <SongIndicatorIcon white>
      {focused ? <SongIndicatorLabel>Added recently</SongIndicatorLabel> : <FiberNewOutlined />}
    </SongIndicatorIcon>
  ) : isPopular && song.language.includes('English') ? (
    <>
      <SongIndicatorIcon>
        {focused && <SongIndicatorLabel>Popular</SongIndicatorLabel>}
        <Star />
      </SongIndicatorIcon>
    </>
  ) : null;
};

const SongIndicatorLabel = styled.div`
  padding: 0 0.5rem;
  line-height: 0;
  margin-top: 0.2rem;

  & + svg {
    margin-left: -0.25rem;
  }
`;

const SongCardTopRightContainer = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0;
  padding: 0 0.5rem;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
`;

const SongIndicator = styled.div`
  height: 2.75rem;
  min-width: 2.75rem;
  box-sizing: border-box;
  color: white;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 0.5rem;
  //transition: 500ms;
`;

const SongIndicatorIcon = styled(SongIndicator)<{ white?: boolean }>`
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  svg,
  img {
    fill: ${(props) => (props.white ? 'white' : styles.colors.text.active)};
    width: 2.5rem;
    height: 2.5rem;
  }
`;

const EurovisionIcon = styled.img`
  padding: 0.35rem;
  margin: 0 0.15rem 0 -0.35rem;
  box-sizing: border-box;
`;

const SongIndicatorStat = styled(SongIndicator)`
  padding: 0 1rem;
`;

const MultiTrackIndicator = styled(SongIndicatorStat)`
  margin-right: auto;

  svg {
    width: 1.75rem;
    height: 1.75rem;
  }
`;
