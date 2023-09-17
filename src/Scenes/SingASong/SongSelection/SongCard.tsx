import { css } from '@emotion/react';
import styled from '@emotion/styled';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { typography } from 'Elements/cssMixins';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { useSongStats } from 'Songs/stats/hooks';
import { addDays, isAfter } from 'date-fns';
import { SongPreview } from 'interfaces';
import { ComponentProps, ReactNode, useCallback } from 'react';

interface Props extends ComponentProps<typeof SongCardContainer> {
  song: SongPreview;
  focused: boolean;
  index?: number;
  expanded?: boolean;
  background?: boolean;
  handleClick?: (index: number) => void;
  video?: ReactNode;
}
export const FinalSongCard = ({
  song,
  focused,
  video,
  children,
  index,
  handleClick,
  background = true,
  expanded = false,
  ...restProps
}: Props) => {
  const onClickCallback = useCallback(() => (handleClick ? handleClick(index!) : undefined), [handleClick, index]);

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
        {!expanded && <SongCardStatsIndicator song={song} />}
        {song.tracksCount > 1 && !expanded && (
          <MultiTrackIndicator data-test="multitrack-indicator">
            <PeopleAltIcon />
            &nbsp; Duet
          </MultiTrackIndicator>
        )}
        <SongListEntryDetailsArtist expanded={expanded}>{song.artist}</SongListEntryDetailsArtist>
        <SongListEntryDetailsTitle expanded={expanded}>{song.title}</SongListEntryDetailsTitle>
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
      </SongInfo>
      {children}
      {video}
    </SongCardContainer>
  );
};

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
  padding: 1.3rem;

  border: 0.1rem black solid;
  border-radius: 0.5rem;
`;

export const SongCardBackground = styled.div<{ focused: boolean; expanded: boolean }>`
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

const SongAuthor = styled(SongListEntryDetailsTitle)`
  font-size: 3rem;
  margin-top: 3rem;
`;

export const SongCardStatsIndicator = ({ song }: { song: SongPreview }) => {
  const stats = useSongStats(song);
  const lastPlayed = stats?.scores?.at(-1)?.date ?? false;

  const playedToday = lastPlayed && isAfter(new Date(lastPlayed), addDays(new Date(), -1));

  return stats?.plays ? (
    <SongStatIndicator data-test="song-stat-indicator">{playedToday ? 'Played today' : stats.plays}</SongStatIndicator>
  ) : null;
};

const SongStatIndicator = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0 1rem;
  height: 2.75rem;
  min-width: 2.75rem;
  box-sizing: border-box;
  border-radius: 5rem;
  color: white;
  background: rgba(0, 0, 0, 0.75);
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
`;
const MultiTrackIndicator = styled(SongStatIndicator)`
  left: 0.5rem;
  right: auto;

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
