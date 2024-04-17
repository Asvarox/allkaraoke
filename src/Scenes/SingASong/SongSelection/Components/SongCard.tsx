import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { FiberNewOutlined, Star } from '@mui/icons-material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { typography } from 'Elements/cssMixins';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import SongFlag from 'Scenes/SingASong/SongSelection/Components/SongCard/SongFlag';
import { filteringFunctions } from 'Scenes/SingASong/SongSelection/Hooks/useSongList';
import FavoritesService from 'Songs/FavoritesService';
import { useSongStats } from 'Songs/stats/hooks';
import dayjs from 'dayjs';
import { SongPreview } from 'interfaces';
import { ComponentProps, ReactNode, useCallback, useMemo } from 'react';

interface Props extends ComponentProps<typeof SongCardContainer> {
  song: SongPreview;
  focused: boolean;
  index?: number;
  groupLetter?: string;
  expanded?: boolean;
  background?: boolean;
  handleClick?: (index: number, groupLetter?: string) => void;
  video?: ReactNode;
  isPopular: boolean;
}

export const FinalSongCard = ({
  song,
  focused,
  video,
  children,
  index,
  groupLetter,
  handleClick,
  isPopular,
  background = true,
  expanded = false,
  ...restProps
}: Props) => {
  const onClickCallback = useCallback(
    () => (handleClick ? handleClick(index!, groupLetter) : undefined),
    [handleClick, index, groupLetter],
  );

  return (
    <SongCardContainer {...restProps} onClick={handleClick ? onClickCallback : undefined}>
      {background && (
        <SongCardBackground
          style={{
            backgroundImage: `url('https://i3.ytimg.com/vi/${song.video}/hqdefault.jpg')`,
          }}
          focused={focused}
          expanded={expanded}
        />
      )}
      <SongInfo expanded={expanded}>
        {!expanded && (
          <SongCardTopRightContainer>
            {song.tracksCount > 1 && !expanded && (
              <MultiTrackIndicator data-test="multitrack-indicator">
                <PeopleAltIcon />
                &nbsp; Duet
              </MultiTrackIndicator>
            )}
            <SongCardStatsIndicator song={song} isPopular={isPopular} focused={!!video} />
          </SongCardTopRightContainer>
        )}
        <SongListEntryDetailsArtist expanded={expanded}>{song.artist}</SongListEntryDetailsArtist>
        <SongListEntryDetailsTitle expanded={expanded}>{song.title}</SongListEntryDetailsTitle>
        <ExpandedData expanded={expanded}>
          {expanded && (
            <>
              {song.author && (
                <SongAuthor expanded={expanded}>
                  by&nbsp;
                  {song.authorUrl ? (
                    <a href={song.authorUrl} target="_blank" rel="noreferrer">
                      {song.author}
                    </a>
                  ) : (
                    song.author
                  )}
                </SongAuthor>
              )}
              <SongListEntryStats song={song} />
            </>
          )}
          {!expanded && <Language song={song} />}
        </ExpandedData>
      </SongInfo>
      {children}
      {video}
    </SongCardContainer>
  );
};

export const Language = styled(SongFlag)`
  height: 2.75rem;
  object-fit: cover;
  border-top-right-radius: 1rem;
  border-bottom-left-radius: 1rem;
  position: absolute;
  z-index: -1;
  left: 0rem;
  bottom: 0rem;
  opacity: 0.95;
`;

export const ExpandedData = styled.div<{ expanded: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

const SongInfo = styled.div<{ expanded: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  z-index: 1;
  box-sizing: border-box;

  flex-direction: column;

  ${(props) =>
    props.expanded &&
    css`
      align-items: flex-start;
      justify-content: flex-start;
    `}
`;

export const SongCardContainer = styled.div`
  font-size: 4.5rem;

  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  flex-direction: column;
  box-sizing: border-box;
  position: relative;
  padding: 0.5rem;

  border: 0.1rem black solid;
  border-radius: 1rem;
`;

export const SongCardBackground = styled.div<{
  focused: boolean;
  expanded: boolean;
}>`
  background-color: ${styles.colors.text.inactive};
  ${(props) => !props.expanded && 'border-radius: 1rem;'}
  position: absolute;
  z-index: -1;
  inset: 0;
  ${(props) =>
    props.theme.graphicSetting === 'high'
      ? css`
          background-size: ${props.focused ? 100 : 110}%;
          ${!props.focused ? 'filter: grayscale(90%);' : ''}
          ${props.expanded ? 'filter: blur(10px);' : ''}
                  transition: 300ms;
          opacity: ${props.focused ? 1 : 0.8};
        `
      : css`
          background-size: 100%;
          opacity: ${props.focused ? 1 : 0.6};
        `}
  background-position: center center;
`;

export const SongListEntryDetails = styled.span<{ expanded?: boolean }>`
  background: rgba(0, 0, 0, 0.7);

  width: auto;
  display: inline-block;
  padding: 0.5rem;
  ${typography};

  text-align: right;
  font-size: ${({ expanded }) => (expanded ? '6rem' : '2.7rem')};
`;

export const SongListEntryDetailsArtist = styled(SongListEntryDetails)`
  color: ${styles.colors.text.active};
`;

export const SongListEntryDetailsTitle = styled(SongListEntryDetails)`
  margin-top: ${(props) => (props.expanded ? '1.5rem' : '0.5rem')};
  color: white;
`;

export const SongAuthor = styled(SongListEntryDetailsTitle)`
  font-size: 3rem;
  margin-top: 3rem;
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

const SongIndicatorStat = styled(SongIndicator)`
  padding: 0 1rem;
`;

const SongIndicatorLabel = styled.div`
  padding: 0 0.5rem;
  line-height: 0;
  margin-top: 0.2rem;

  & + svg {
    margin-left: -0.25rem;
  }
`;

const SongIndicatorIcon = styled(SongIndicator)<{ white?: boolean }>`
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    fill: ${(props) => (props.white ? 'white' : styles.colors.text.active)};
    width: 2.5rem;
    height: 2.5rem;
  }
`;

export const SongCardFavorite = ({ favorite, songId }: { songId: string; favorite?: boolean }) => {
  return (
    <SongCardFavoriteBase
      favorite={favorite}
      data-test="song-favorite-indicator"
      onClick={(e) => {
        e.stopPropagation();
        console.log('songId', songId, !favorite);

        FavoritesService.setFavorite(songId, !favorite);
      }}>
      {/*{favorite ? '★' : '☆'}*/}★
    </SongCardFavoriteBase>
  );
};

const SongCardFavoriteBase = styled.div<{ favorite?: boolean }>`
  height: 2.75rem;
  min-width: 2.75rem;
  box-sizing: border-box;
  border-radius: 5rem;
  ${typography};
  color: ${(props) => (props.favorite ? styles.colors.text.active : 'white')};
  font-weight: bold;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
`;
const MultiTrackIndicator = styled(SongIndicatorStat)`
  margin-right: auto;

  svg {
    width: 1.75rem;
    height: 1.75rem;
  }
`;

export const SongListEntryStats = ({ song }: { song: SongPreview }) => {
  const stats = useSongStats(song);

  return (
    <SongAuthor>
      {stats?.plays ? `Played ${stats.plays} time${stats.plays > 1 ? 's' : ''}` : 'Never played yet'}
    </SongAuthor>
  );
};
