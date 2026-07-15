import { Slider } from '@mui/material';
import { useEffect, useState } from 'react';

import { NotesSection } from '~/interfaces';

interface Props {
  notesSections: NotesSection[];
  currentSectionIndex: number;
  onSeekSection: (sectionIndex: number) => void;
}

export default function SectionSlider({ notesSections, currentSectionIndex, onSeekSection }: Props) {
  const [sectionSliderValue, setSectionSliderValue] = useState(0);
  const [isDraggingSectionSlider, setIsDraggingSectionSlider] = useState(false);
  const [isWaitingForSectionSliderSync, setIsWaitingForSectionSliderSync] = useState(false);

  useEffect(() => {
    if (isDraggingSectionSlider || isWaitingForSectionSliderSync || notesSections.length === 0) return;

    setSectionSliderValue(Math.max(Math.min(currentSectionIndex, notesSections.length - 1), 0));
  }, [currentSectionIndex, isDraggingSectionSlider, isWaitingForSectionSliderSync, notesSections.length]);

  useEffect(() => {
    if (!isWaitingForSectionSliderSync) return;

    if (currentSectionIndex === sectionSliderValue) {
      setIsWaitingForSectionSliderSync(false);
    }
  }, [currentSectionIndex, isWaitingForSectionSliderSync, sectionSliderValue]);

  if (notesSections.length === 0) return null;

  return (
    <div className="px-5">
      <Slider
        data-test="section-slider"
        size="small"
        min={0}
        max={Math.max(notesSections.length - 1, 0)}
        step={1}
        value={sectionSliderValue}
        disabled={notesSections.length <= 1}
        onChange={(_event, value) => {
          setIsDraggingSectionSlider(true);
          setSectionSliderValue(value as number);
        }}
        onChangeCommitted={(_event, value) => {
          const nextSection = value as number;

          setSectionSliderValue(nextSection);
          setIsWaitingForSectionSliderSync(true);
          setIsDraggingSectionSlider(false);
          onSeekSection(nextSection);
        }}
      />
    </div>
  );
}
