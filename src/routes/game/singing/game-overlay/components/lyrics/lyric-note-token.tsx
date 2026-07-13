import { PropsWithChildren } from 'react';
import { Note, songBeat } from '~/interfaces';
import { getNoteFill, hasLyricTrailingSpace } from './utils';

function LyricTrailingSpace({ lyrics }: { lyrics: string }) {
  if (!hasLyricTrailingSpace(lyrics)) return null;
  return <>&nbsp;</>;
}

export function LyricNoteTokenWrapper({ note, children }: PropsWithChildren<{ note: Note }>) {
  return <span className={note.type === 'freestyle' ? 'italic' : 'not-italic'}>{children}</span>;
}

export function LyricNoteTokenInactive({ note, pop, children }: PropsWithChildren<{ note: Note; pop: number }>) {
  return (
    <span className={pop === 1 ? 'animate-lyrics-pop inline-block' : 'inline-block'}>
      {children}
      <LyricTrailingSpace lyrics={note.lyrics} />
    </span>
  );
}

function LyricActive({ fill, color, children }: PropsWithChildren<{ fill: number; color: string }>) {
  return (
    <span
      style={{
        clipPath: `inset(0 ${(1 - (fill === 0 ? 0 : fill + 0.05)) * 100}% -3rem 0)`,
        color,
      }}>
      {children}
    </span>
  );
}

export function LyricNoteTokenActive({
  note,
  fill,
  color,
  pop,
  children,
}: PropsWithChildren<{ note: Note; fill: number; color: string; pop: number }>) {
  return (
    <span className="absolute z-1">
      <span className={pop === 1 ? 'animate-lyrics-pop inline-block' : 'inline-block'}>
        <LyricActive fill={fill} color={color}>
          {children}
        </LyricActive>
        <LyricTrailingSpace lyrics={note.lyrics} />
      </span>
    </span>
  );
}

type LyricNoteTokenProps = {
  note: Note;
  currentBeat: songBeat;
  playerColor: string;
};

const LyricNoteTokenBase = ({ note, currentBeat, playerColor }: LyricNoteTokenProps) => {
  const fill = getNoteFill(currentBeat, note);
  const pop = Math.min(1, Math.ceil(fill));

  return (
    <LyricNoteTokenWrapper note={note}>
      <LyricNoteTokenActive note={note} fill={fill} color={playerColor} pop={pop}>
        {note.lyrics.trim()}
      </LyricNoteTokenActive>
      <LyricNoteTokenInactive note={note} pop={pop}>
        {note.lyrics.trim()}
      </LyricNoteTokenInactive>
    </LyricNoteTokenWrapper>
  );
};

const LyricNoteToken = Object.assign(LyricNoteTokenBase, {
  Wrapper: LyricNoteTokenWrapper,
  Active: LyricNoteTokenActive,
  Inactive: LyricNoteTokenInactive,
});

export default LyricNoteToken;
