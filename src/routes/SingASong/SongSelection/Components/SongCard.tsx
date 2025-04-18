import styled from '@emotion/styled';
import { SongPreview } from 'interfaces';
import Box from 'modules/Elements/AKUI/Primitives/Box';
import { typography } from 'modules/Elements/cssMixins';
import { BackgroundContext } from 'modules/Elements/LayoutWithBackground';
import styles from 'modules/GameEngine/Drawing/styles';
import { useSongStats } from 'modules/Songs/stats/hooks';
import { ComponentProps, ReactNode, use, useCallback } from 'react';
import { GraphicSetting, useSettingValue } from 'routes/Settings/SettingsState';
import SongFlag from 'routes/SingASong/SongSelection/Components/SongCard/SongFlag';
import { TopContainer } from 'routes/SingASong/SongSelection/Components/SongCard/TopContainer';

interface Props extends ComponentProps<typeof SongCardContainer> {
  song: SongPreview;
  focused: boolean;
  songId?: string;
  groupLetter?: string;
  expanded?: boolean;
  background?: boolean;
  handleClick?: (songId: string, groupLetter?: string) => void;
  video?: ReactNode;
  isPopular: boolean;
  forceFlag: boolean;
  'data-expanded'?: boolean;
}

export const FinalSongCard = ({
  song,
  focused,
  video,
  children,
  songId,
  groupLetter,
  handleClick,
  isPopular,
  background = true,
  forceFlag = false,
  ...restProps
}: Props) => {
  const { theme } = use(BackgroundContext);
  const expanded = restProps['data-expanded'] ?? false;
  const onClickCallback = useCallback(
    () => (handleClick ? handleClick(songId!, groupLetter) : undefined),
    [handleClick, songId, groupLetter],
  );
  const [graphicSetting] = useSettingValue(GraphicSetting);

  return (
    <SongCardContainer {...restProps} onClick={handleClick ? onClickCallback : undefined}>
      {background && (
        <SongCardBackground
          style={{
            backgroundImage: `url('https://i3.ytimg.com/vi/${song.video}/hqdefault.jpg')`,
          }}
          data-focused={expanded ? false : focused}
          data-expanded={restProps['data-expanded']}
          data-graphic-setting={graphicSetting}
          data-theme={theme}
        />
      )}
      <SongInfo data-expanded={expanded}>
        {!expanded && <TopContainer song={song} isPopular={isPopular} video={video} />}
        <SongListEntryDetailsArtist data-expanded={expanded}>{song.artist}</SongListEntryDetailsArtist>
        <SongListEntryDetailsTitle data-expanded={expanded}>{song.title}</SongListEntryDetailsTitle>
        <ExpandedData data-expanded={expanded}>
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
  border-top-right-radius: 0.4rem;
  border-bottom-left-radius: 0.4rem;
  position: absolute;
  z-index: -1;
  left: 0rem;
  bottom: 0rem;
  opacity: 0.95;
`;

export const ExpandedData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

const SongInfo = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  z-index: 1;
  box-sizing: border-box;

  flex-direction: column;

  &[data-expanded='true'] {
    align-items: flex-start;
    justify-content: flex-start;
  }
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
  border-radius: 0.5rem;
`;

export const SongCardBackground = styled.div`
  background-color: #2b2b2b;
  border-radius: 0.4rem;
  &[data-expanded='true'] {
    border-radius: 0;
  }
  position: absolute;
  z-index: -1;
  inset: 0;

  &[data-graphic-setting='high'] {
    transition: 300ms;
    &[data-focused='true'] {
      background-size: 100%;
      opacity: 1;
    }
    &[data-focused='false'] {
      background-size: 110%;
      filter: grayscale(90%);
      opacity: 0.8;
    }
    &[data-expanded='true'] {
      filter: blur(10px);
    }
    &[data-theme='eurovision'] {
      opacity: 0.95;
    }
  }
  &[data-graphic-setting='low'] {
    background-size: 100%;
    opacity: 0.6;
    &[data-focused='true'] {
      opacity: 1;
    }
  }
  background-position: center center;
`;

export const SongListEntryDetails = styled(Box)<{ expanded?: boolean }>`
  background: rgba(0, 0, 0, 0.7);

  width: auto;
  display: inline-block;
  padding: 0.5rem;
  ${typography};

  text-align: right;
  font-size: 2.7rem;

  &[data-expanded='true'] {
    font-size: 6rem;
  }
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
