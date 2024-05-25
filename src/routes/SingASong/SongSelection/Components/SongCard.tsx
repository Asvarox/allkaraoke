import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { SongPreview } from 'interfaces';
import { typography } from 'modules/Elements/cssMixins';
import styles from 'modules/GameEngine/Drawing/styles';
import { useSongStats } from 'modules/Songs/stats/hooks';
import { ComponentProps, ReactNode, useCallback } from 'react';
import SongFlag from 'routes/SingASong/SongSelection/Components/SongCard/SongFlag';
import { TopContainer } from 'routes/SingASong/SongSelection/Components/SongCard/TopContainer';

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
  forceFlag: boolean;
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
  forceFlag = false,
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
        {!expanded && <TopContainer song={song} isPopular={isPopular} video={video} />}
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
          {!expanded && <Language song={song} forceFlag={forceFlag} />}
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
  background-color: #2b2b2b;
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

export const SongListEntryStats = ({ song }: { song: SongPreview }) => {
  const stats = useSongStats(song);

  return (
    <SongAuthor>
      {stats?.plays ? `Played ${stats.plays} time${stats.plays > 1 ? 's' : ''}` : 'Never played yet'}
    </SongAuthor>
  );
};
