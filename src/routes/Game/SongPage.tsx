import clsx from 'clsx';
import { Song, SongPreview } from 'interfaces';

interface Props {
  width: number;
  height: number;
  songData: SongPreview | Song;
  children: React.ReactNode;
  background?: React.ReactNode;
}

export default function SongPage({ songData, background, width, height, children, ...restProps }: Props) {
  return (
    <div className="relative overflow-y-hidden bg-black" style={{ width, height }} {...restProps}>
      <BackgroundImage video={songData.video} blur />
      {background && <div className="absolute inset-0 z-10">{background}</div>}

      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="pointer-events-none relative mx-auto h-full max-w-[80vw] text-white">
          <ContentElement className="text-active mobile:mt-2 mobile:text-lg mt-5 text-5xl">
            {songData.title}
          </ContentElement>
          <br />
          <ContentElement className="mobile:text-md text-4xl">{songData.artist}</ContentElement>
          <br />
          {songData.author && (
            <ContentElement className="mobile:text-sm text-xl">
              by&nbsp;
              {songData.authorUrl ? <a href={songData.authorUrl}>{songData.author}</a> : songData.author}
            </ContentElement>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export const ContentElement = ({ className, ...restProps }: React.ComponentProps<'span'>) => (
  <span
    className={clsx(
      'typography mobile:mb-1 mobile:py-0.5 mb-2.5 inline-block bg-black/50 px-5 py-1.5 backdrop-blur-sm',
      className,
    )}
    {...restProps}
  />
);

const BackgroundImage = ({ blur, video }: { blur: boolean; video: string }) => (
  <div
    className={clsx('absolute inset-0 z-0 bg-cover bg-center', blur ? 'blur-sm' : undefined)}
    style={{ backgroundImage: `url('https://i3.ytimg.com/vi/${video}/hqdefault.jpg')` }}
  />
);
