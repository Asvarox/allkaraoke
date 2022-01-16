import { useMemo } from "react";
import { Section } from "../../../../interfaces";

export default function useCurrentSectionIndex(sections: Section[], currentBeat: number) {
    const wholeBeat = Math.floor(currentBeat);
    return useMemo(
        () => sections.findIndex((section, index) => {
                if (wholeBeat < 0) return true;
                if (wholeBeat < section.start) return false;
                if (index === sections.length - 1) return true;
                if (sections[index + 1].start > wholeBeat) {
                    return true;
                }
                return false;
            }),
        [wholeBeat, sections],
    );
}