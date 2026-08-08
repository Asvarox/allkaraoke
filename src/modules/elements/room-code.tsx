import { cn } from '~/utils/cn';

interface Props {
  code: string;
  /**
   * How far the letters are spread. `wide` is the remote-mic connection screen, where the code is
   * the thing you came to the page for; `tight` fits it inline after a label, like the online lobby.
   */
  size?: 'tight' | 'wide';
  className?: string;
}

/** A room/game code, one letter per span so it reads as separate characters to be copied down or
 * spelled out rather than as a word. */
export default function RoomCode({ code, size = 'wide', className, ...props }: Props) {
  return (
    <strong
      className={cn(
        'subtle-focus inline-flex rounded-md py-1 uppercase',
        size === 'tight' ? 'gap-3 px-3' : 'gap-4 px-4',
        className,
      )}
      {...props}>
      {code.split('').map((letter, i) => (
        <span key={i}>{letter}</span>
      ))}
    </strong>
  );
}
