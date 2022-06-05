import { Note } from 'interfaces';
import { capitalize } from 'lodash';
import { SpriteNames } from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/spriteMap';
import drawSpriteWithStartAndEnd from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/spriteWithStartAndEnd';

const getSpriteName = (noteType: Note['type']) => {
    return `note${capitalize(noteType)}` as SpriteNames;
};

export default function drawNote(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, note: Note) {
    const spriteName = getSpriteName(note.type);

    drawSpriteWithStartAndEnd(ctx, spriteName, x, y, width);
}
