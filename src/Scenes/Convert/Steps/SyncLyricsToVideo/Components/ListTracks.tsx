import { Song } from 'interfaces';
import { PlayerRef } from 'Scenes/Game/Singing/Player';

interface Props {
  player: PlayerRef;
  song: Song;
  beatLength: number;
}

export default function ListTracks({ song, player, beatLength }: Props) {
  return (
    <>
      {/*{song.tracks.map(({ sections }, index) => {*/}
      {/*    const notesSections = sections.filter(isNotesSection);*/}
      {/*    const firstNote = notesSections[0].notes[0];*/}

      {/*    const lastNote = notesSections.at(-1)?.notes.at(-1);*/}

      {/*    if (!firstNote || !lastNote || !beatLength) return null;*/}

      {/*    return (*/}
      {/*        <EditorRow key={index}>*/}
      {/*            <strong>Track #{index + 1} - </strong>*/}
      {/*            Start: {msec(firstNote.start * beatLength + song.gap, player)}, end:{' '}*/}
      {/*            {msec(lastNote.start * beatLength + song.gap, player)}*/}
      {/*        </EditorRow>*/}
      {/*    );*/}
      {/*})}*/}
    </>
  );
}
