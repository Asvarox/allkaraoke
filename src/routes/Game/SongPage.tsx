import clsx from 'clsx';
import { Song, SongPreview } from '~/interfaces';

interface Props {
  width: number;
  height: number;
  songData: SongPreview | Song;
  children: React.ReactNode;
  background?: React.ReactNode;
}

export default function SongPage({ songData, background, width, height, children, ...restProps }: Props) {
  return (
    <div className="relative overflow-y-auto bg-black" style={{ width, height }} {...restProps}>
      <BackgroundImage video={songData.video} blur />
      {background && <div className="fixed inset-0">{background}</div>}

      <div className="relative mx-auto h-full max-w-440 px-4 text-white">
        <div className="pointer-events-none mb-4 flex flex-col items-start gap-1 text-white">
          <ContentElement className="text-active mt-2 text-lg lg:text-xl 2xl:mt-5 2xl:text-5xl">
            {songData.title}
          </ContentElement>
          <ContentElement className="text-md lg:text-lg 2xl:text-4xl">{songData.artist}</ContentElement>
          {songData.author && (
            <ContentElement className="lg:text-md text-sm 2xl:text-xl">
              by&nbsp;
              {songData.authorUrl ? <a href={songData.authorUrl}>{songData.author}</a> : songData.author}
            </ContentElement>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export const ContentElement = ({ className, ...restProps }: React.ComponentProps<'span'>) => (
  <span className={clsx('typography inline-block bg-black/50 px-5 py-0.5', className)} {...restProps} />
);

const BackgroundImage = ({ blur, video }: { blur: boolean; video: string }) => (
  <div
    className={clsx('fixed inset-0 z-0 bg-cover bg-center', blur ? 'blur-sm' : undefined)}
    style={{ backgroundImage: `url('https://i3.ytimg.com/vi/${video}/hqdefault.jpg')` }}
  />
);
