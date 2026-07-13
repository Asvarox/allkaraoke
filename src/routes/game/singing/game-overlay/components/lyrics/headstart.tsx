import { ComponentProps, useMemo } from 'react';
import tinycolor from 'tinycolor2';
import { NotesSection, songBeat } from '~/interfaces';
import { getFirstNoteStartFromSections } from '~/modules/songs/utils/notes-selectors';
import { getHeadstartPercent } from './utils';

function BaseHeadstart(props: ComponentProps<'span'>) {
  return <span {...props} className={`absolute right-24 my-2 h-8 w-40 ${props.className ?? ''}`} />;
}

export default function Headstart({
  section,
  currentBeat,
  color,
}: {
  section: NotesSection | null;
  currentBeat: songBeat;
  color: string;
}) {
  // Headstart is driven by how far the current beat has progressed from the section start
  // to the first lyric note. That keeps the container from having to know about the note layout.
  const percent = useMemo(() => {
    if (!section) return 2;

    const beatsBetweenSectionAndNote = getFirstNoteStartFromSections([section]) - section.start;

    return getHeadstartPercent(currentBeat, section.start, beatsBetweenSectionAndNote);
  }, [currentBeat, section]);

  const rgbColor = useMemo(() => {
    const rgb = tinycolor(color).toRgb();
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }, [color]);

  const scaled = Math.min(1, 2 - percent);
  const dynamicRight = Math.max(0, 1 - percent) * 15;

  return (
    <BaseHeadstart
      style={{
        transformOrigin: 'right',
        transform: `scaleX(${scaled})`,
        right: `${dynamicRight}rem`,
        background: `linear-gradient(270deg, rgba(${rgbColor}, 1) 0%, rgba(${rgbColor}, 0.5) 25%, rgba(${rgbColor}, 0) 100%)`,
      }}
    />
  );
}
