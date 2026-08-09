import { cn } from '~/utils/cn';

interface Props {
  code: string;
  className?: string;
}

/** A room/game code, one letter per span so it reads as separate characters to be copied down or
 * spelled out rather than as a word. */
export default function RoomCode({ code, className, ...props }: Props) {
  return (
    <strong className={cn('subtle-focus inline-flex gap-3 rounded-md px-3 py-1 uppercase', className)} {...props}>
      {code.split('').map((letter, i) => (
        <span key={i}>{letter}</span>
      ))}
    </strong>
  );
}
