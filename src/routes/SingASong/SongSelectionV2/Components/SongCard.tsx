import { Icon } from '@iconify-icon/react';
import { ComponentProps, createContext, forwardRef, useContext } from 'react';
import { SongPreview } from '~/interfaces';
import { Chip } from '~/modules/Elements/AKUI/Chip';
import SongFlag from '~/routes/SingASong/SongSelectionV2/Components/SongCard/SongFlag';
import { SongCardStatsIndicator } from '~/routes/SingASong/SongSelectionV2/Components/SongCard/TopContainer';
import { cn } from '~/utils/cn';

interface SongCardContextValue {
  song: SongPreview;
  isPopular: boolean;
  forceFlag: boolean;
}

const SongCardContext = createContext<SongCardContextValue | null>(null);

function useSongCardContext() {
  const ctx = useContext(SongCardContext);
  if (!ctx) throw new Error('SongCard compound components must be used within <SongCard>');
  return ctx;
}

// --- Sub-components ---

const Thumbnail = forwardRef<HTMLDivElement, ComponentProps<'div'>>(function Thumbnail(
  { children, className, ...props },
  ref,
) {
  const { song } = useSongCardContext();
  return (
    <div
      ref={ref}
      className={`relative isolate aspect-video shrink-0 overflow-hidden rounded bg-[#2b2b2b] ${className ?? ''}`}
      {...props}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('https://i3.ytimg.com/vi/${song.video}/hqdefault.jpg')` }}
      />
      {children && <div className="absolute inset-0 z-20">{children}</div>}
    </div>
  );
});

function Footer({ className, ...props }: ComponentProps<'div'>) {
  return <div className={`flex min-h-0 flex-1 flex-col gap-1 px-2 pt-2 pb-1.5 ${className ?? ''}`} {...props} />;
}

function SongTitle({ className, ...props }: ComponentProps<'span'>) {
  const { song } = useSongCardContext();
  return (
    <span
      data-name="title"
      className={`text-active truncate text-lg leading-tight font-bold ${className ?? ''}`}
      {...props}>
      {props.children ?? song.title}
    </span>
  );
}

function Artist({ className, ...props }: ComponentProps<'span'>) {
  const { song } = useSongCardContext();
  return (
    <span
      data-name="artist"
      className={`truncate text-[20px] leading-tight text-slate-300 ${className ?? ''}`}
      {...props}>
      {props.children ?? song.artist}
    </span>
  );
}

function Badges({ className, ...props }: ComponentProps<'div'>) {
  return <div className={`mt-auto flex items-center gap-1 overflow-hidden ${className ?? ''}`} {...props} />;
}

function BadgeFlag({ className, ...props }: Omit<ComponentProps<typeof SongFlag>, 'song' | 'forceFlag'>) {
  const { song, forceFlag } = useSongCardContext();
  return <SongFlag song={song} forceFlag={forceFlag} chip className={className} {...props} />;
}

function BadgeDuet({ className, ...props }: ComponentProps<typeof Chip>) {
  const { song } = useSongCardContext();
  if (song.tracksCount <= 1) return null;
  return (
    <Chip
      variant="zinc"
      data-test="multitrack-indicator"
      className={`[&_svg]:h-4 [&_svg]:w-4 ${className ?? ''}`}
      {...props}>
      <Icon icon="ic:round-people-alt" width="1rem" height="1rem" />
      <span>Duet</span>
    </Chip>
  );
}

function BadgeStats({
  focused = false,
  compact = false,
  ...props
}: Partial<Pick<ComponentProps<typeof SongCardStatsIndicator>, 'focused' | 'compact'>>) {
  const { song, isPopular } = useSongCardContext();
  return <SongCardStatsIndicator song={song} isPopular={isPopular} focused={focused} compact={compact} {...props} />;
}

// --- Main SongCard ---

interface SongCardProps extends ComponentProps<'div'> {
  song: SongPreview;
  isPopular: boolean;
  forceFlag?: boolean;
  /** When true, applies the focused scale/border/shadow style (scale-100 md:scale-[1.075] + amber border + glow) */
  focused?: boolean;
}

function SongCardRoot({
  song,
  isPopular,
  forceFlag = false,
  focused = false,
  children,
  className,
  ...props
}: SongCardProps) {
  return (
    <SongCardContext.Provider value={{ song, isPopular, forceFlag }}>
      <div
        className={cn(
          'relative box-border flex h-full w-full flex-col overflow-hidden rounded-xl bg-slate-900/80 p-1.5 transition-all duration-300',
          focused
            ? 'scale-100 border-2 border-amber-400 shadow-[0_0_24px_rgba(250,204,21,0.35)] md:scale-[1.075]'
            : 'border border-white/10',
          className,
        )}
        {...props}>
        {children}
      </div>
    </SongCardContext.Provider>
  );
}

// Compose the public API
export const SongCard = Object.assign(SongCardRoot, {
  Thumbnail,
  Footer,
  SongTitle,
  Artist,
  Badges: Object.assign(Badges, {
    Flag: BadgeFlag,
    Duet: BadgeDuet,
    Stats: BadgeStats,
  }),
});
