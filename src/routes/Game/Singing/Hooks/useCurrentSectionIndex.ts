import { useEffect, useState } from 'react';
import { Section } from '~/interfaces';
import { PlayerRef } from '../Player';

export default function useCurrentSectionIndex(
  sections: Section[],
  player: PlayerRef,
  beatLength: number,
  gap: number,
) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentTime = await player.getCurrentTime();
      const currentBeat = (currentTime - gap) / beatLength;
      const wholeBeat = Math.floor(currentBeat);

      const sectionIndex = sections.findIndex((section, index) => {
        if (wholeBeat < 0) return true;
        if (wholeBeat < section.start) return false;
        if (index === sections.length - 1) return true;
        if (sections[index + 1].start > wholeBeat) {
          return true;
        }
        return false;
      });
      setCurrentSectionIndex(sectionIndex);
    }, 50);
    return () => clearInterval(interval);
  }, [sections, player, beatLength, gap]);

  return currentSectionIndex;
}
