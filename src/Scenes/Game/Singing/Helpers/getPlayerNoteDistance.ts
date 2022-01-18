import { noDistanceNoteTypes } from '../../../../consts';
import { PlayerNote } from '../../../../interfaces';

export default function getPlayerNoteDistance(note: PlayerNote) {
    return noDistanceNoteTypes.includes(note.note.type) ? 0 : note.distance;
}
