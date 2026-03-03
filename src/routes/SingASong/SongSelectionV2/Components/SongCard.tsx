import { ComponentProps, ReactNode, useCallback } from 'react';
import { SongPreview } from '~/interfaces';
import { TopContainer } from '~/routes/SingASong/SongSelectionV2/Components/SongCard/TopContainer';

interface Props extends ComponentProps<'div'> {
  song: SongPreview;
  focused: boolean;
  songId?: string;
  groupLetter?: string;
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
  className,
  ...restProps
}: Props) => {
  const onClickCallback = useCallback(
    () => (handleClick ? handleClick(songId!, groupLetter) : undefined),
    [handleClick, songId, groupLetter],
  );

  return (
    <div
      className={[
        'relative box-border h-full w-full overflow-hidden rounded-lg border border-black',
        focused ? 'ring-2 ring-white' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick ? onClickCallback : undefined}
      {...restProps}>
      {/* YouTube thumbnail background */}
      {background && (
        <div
          className="absolute inset-0 bg-[#2b2b2b] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://i3.ytimg.com/vi/${song.video}/hqdefault.jpg')`,
          }}
        />
      )}

      {/* Top-right badge row: duet, stats/new/popular/eurovision, flag */}
      <TopContainer song={song} isPopular={isPopular} video={video} forceFlag={forceFlag} />

      {/* Bottom gradient scrim with artist + title */}
      <div className="absolute right-0 bottom-0 left-0 z-10 flex flex-col items-end bg-linear-to-t from-black/80 to-transparent px-2 pt-8 pb-2">
        <span
          data-name="artist"
          className="text-active inline-block bg-black/70 px-2 py-0.5 text-right text-[2rem] leading-tight">
          {song.artist}
        </span>
        <span
          data-name="title"
          className="mt-1 inline-block bg-black/70 px-2 py-0.5 text-right text-[2rem] leading-tight text-white">
          {song.title}
        </span>
      </div>

      {/* Video slot — rendered absolutely over the thumbnail */}
      {video && <div className="absolute inset-0 z-20">{video}</div>}

      {children}
    </div>
  );
};
