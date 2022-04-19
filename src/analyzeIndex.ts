import { SongPreview } from 'interfaces';
import { uniq } from 'lodash';

const data = {
    language: {
        kinds: [] as string[],
        missing: [] as string[],
    },
    genre: {
        kinds: [] as string[],
        missing: [] as string[],
    },
};

type Data = typeof data;

const index: SongPreview[] = require('../public/songs/index.json');

index.forEach((song) => {
    Object.entries(data).forEach(([key, val]) => {
        if (key in song) {
            val.kinds.push(song[key as keyof Data]!);
        } else {
            val.missing.push(song.file);
        }
    });
});
Object.entries(data).forEach(([key, val]) => {
    val.kinds = uniq(val.kinds);
});

console.log(JSON.stringify(data, undefined, 2));
