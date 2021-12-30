import { calcDistance } from "../calcDistance";
import { PitchRecord, Song } from "../interfaces";

const pitchPadding = 6;

const playerColors = ['blue', 'red'];

export default function drawFrame(
    song: Song, songBeatLength: number, minPitch: number, maxPitch: number,
    canvas: HTMLCanvasElement, currentTime: number, currentSection: number, pitches: [PitchRecord[], PitchRecord[]] | [PitchRecord[]]
) {
    const ctx = canvas.getContext('2d');
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    
    const section = song.sections[currentSection];
    const lastNote = section.notes[section.notes.length - 1];
    const timeSectionGap = (section.start * songBeatLength) + song.gap;
    const relativeTime = Math.max(0, currentTime - timeSectionGap);
    const maxTime = (lastNote.start + lastNote.length - section.start) * songBeatLength;

    const beatLength = (canvas.width - 20) / ((lastNote.start + lastNote.length) - section.start);
    const pitchStepHeight = ((canvas.height * .5) - 20) / (maxPitch - minPitch + (pitchPadding * 2));

    ctx!.strokeStyle = 'black';
    const timeLineX = 10 + (relativeTime / maxTime) * (canvas.width - 20);
    ctx!.beginPath();
    ctx!.moveTo(timeLineX, 0);
    ctx!.lineTo(timeLineX, canvas.height);
    ctx!.stroke();

    
    pitches.forEach((pitchHistory, index) => {
        const regionPaddingTop = index * canvas.height * .5;
        
        ctx!.fillStyle = 'green';
        section.notes.forEach(note => ctx?.fillRect(
            10 + (beatLength * (note.start - section.start)),
            regionPaddingTop + 10 + (pitchStepHeight * (maxPitch - note.pitch + pitchPadding)),
            beatLength * note.length,
            20
        ));
        
        ctx!.fillStyle = playerColors[index];

    let previousNote: { pitch: number, lyrics: string } = section.notes[0];

    pitchHistory.forEach((entry: {pitch: number, timestamp: number}) => {
        const currentBeat = Math.max(0, Math.floor((entry.timestamp - song.gap) / songBeatLength));
        // console.log(currentTime, currentBeat, section.notes)
        const noteAtTheTime = section.notes.find(note => note.start <= currentBeat && (note.start + note.length) > currentBeat) ?? previousNote;
        // const notePitchAtTheTime = section.notes[0].pitch;
        previousNote = noteAtTheTime;
  
        if (noteAtTheTime === undefined) return;
  
        const entryRelativeTime = Math.max(0, entry.timestamp - timeSectionGap);
        const entryX = 10 + (entryRelativeTime / maxTime) * (canvas!.width - 20)
  
        const toleratedDistance = calcDistance(entry.pitch, noteAtTheTime.pitch);
        const final = maxPitch - (noteAtTheTime.pitch + toleratedDistance) + pitchPadding;
  
        ctx?.fillRect(
          entryX - 20,
          10 + regionPaddingTop + (final * pitchStepHeight),
          20,
          20
        );
      });
    });
}