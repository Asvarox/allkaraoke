import { ComponentProps, PropsWithChildren } from 'react';
import { Note, songBeat } from '~/interfaces';
import { getNoteFill, hasLyricTrailingSpace } from './utils';

function LyricTrailingSpace({ lyrics }: { lyrics: string }) {
  if (!hasLyricTrailingSpace(lyrics)) return null;
  return <>&nbsp;</>;
}

const BaseLyricActive = (props: ComponentProps<'span'>) => <span {...props} />;

function LyricActive({ fill, color, children }: PropsWithChildren<{ fill: number; color: string }>) {
  return (
    <BaseLyricActive
      style={{
        clipPath: `inset(0 ${(1 - (fill === 0 ? 0 : fill + 0.05)) * 100}% -3rem 0)`,
        color: `${color}`,
      }}>
      {children}
    </BaseLyricActive>
  );
}

export default function LyricNoteToken({
  note,
  currentBeat,
  playerColor,
}: {
  note: Note;
  currentBeat: songBeat;
  playerColor: string;
}) {
  const fill = getNoteFill(currentBeat, note);
  const pop = Math.min(1, Math.ceil(fill));

  return (
    <span className={note.type === 'freestyle' ? 'italic' : 'not-italic'}>
      <span className="absolute z-[1]">
        <span className={pop === 1 ? 'animate-lyrics-pop inline-block' : 'inline-block'}>
          <LyricActive fill={fill} color={playerColor}>
            {note.lyrics.trim()}
          </LyricActive>
          <LyricTrailingSpace lyrics={note.lyrics} />
        </span>
      </span>
      <span className={pop === 1 ? 'animate-lyrics-pop inline-block' : 'inline-block'}>
        {note.lyrics.trim()}
        <LyricTrailingSpace lyrics={note.lyrics} />
      </span>
    </span>
  );
}
