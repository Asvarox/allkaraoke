import { useMemo } from "react";
import { Section } from "../../../../interfaces";

export default function useCurrentSectionIndex(sections: Section[], currentBeat: number) {
    return useMemo(
        () => sections.findIndex((section, index) => {
                if (currentBeat < 0) return true;
                if (currentBeat < section.start) return false;
                if (index === sections.length - 1) return true;
                if (sections[index + 1].start > currentBeat) {
                    return true;
                }
                return false;
            }),
        [currentBeat, sections],
    );
}