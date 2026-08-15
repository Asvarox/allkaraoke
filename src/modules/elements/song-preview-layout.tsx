import { ReactNode } from 'react';

interface Props {
  /**
   * Expanded is the full card — the opened song preview, and the online lobby. Collapsed is the
   * small card in the song list, which only lays out the thumbnail and its footer.
   */
  expanded: boolean;
  /** Mobile-only way back out, above everything else. Expanded only. */
  back?: ReactNode;
  title: ReactNode;
  artist: ReactNode;
  /** Under title and artist — the lobby's room code and invite link. */
  underTitle?: ReactNode;
  /**
   * The thumbnail (a video player, in both uses). It keeps a fixed position in the tree across
   * expand/collapse so the YouTube iframe inside it is never unmounted — which is why the wrappers
   * below fall back to `display: contents` rather than disappearing when collapsed.
   */
  thumbnail: ReactNode;
  /** Under the thumbnail — the lobby's song details. Expanded only. */
  underThumbnail?: ReactNode;
  /** The card's own footer in the song list: title, artist and badges over the small card. */
  collapsedFooter?: ReactNode;
  /** The bottom row: song settings in the song list, singers and actions in the lobby. */
  footer?: ReactNode;
}

/**
 * The two-column song card shared by the song list's expanded preview and the online lobby: title
 * and artist on the left, the looping video on the right, and a full-width row underneath. Every
 * part is a slot — the two screens agree on the shape, not on what goes in it.
 */
export default function SongPreviewLayout({
  expanded,
  back,
  title,
  artist,
  underTitle,
  thumbnail,
  underThumbnail,
  collapsedFooter,
  footer,
}: Props) {
  return (
    <>
      {expanded && back && <div className="mb-2 flex items-center sm:hidden">{back}</div>}
      <div className={expanded ? 'flex flex-col-reverse items-start gap-2 sm:flex-row sm:gap-24' : 'contents'}>
        {expanded && (
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-3">
            {title}
            {artist}
            {underTitle}
          </div>
        )}
        <div className={expanded ? 'flex w-full shrink-0 flex-col gap-2 sm:w-2/5' : 'contents'}>
          {thumbnail}
          {expanded && underThumbnail}
        </div>
      </div>
      {expanded ? <div className="mt-3 sm:mt-auto">{footer}</div> : collapsedFooter}
    </>
  );
}

interface SplitProps {
  /** The narrow left column: the mic check, the room's singers. */
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** The bottom row's own split, on the same grid as the card above it. */
function Split({ aside, children, className }: SplitProps) {
  return (
    <div
      className={`flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:gap-24 [&_hr]:opacity-25 ${className ?? ''}`}>
      <div className="w-full shrink-0 sm:w-2/5">{aside}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">{children}</div>
    </div>
  );
}

SongPreviewLayout.Split = Split;
