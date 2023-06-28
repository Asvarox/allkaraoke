import { SongPreview } from 'interfaces';
import { uniq } from 'lodash-es';

const data = {
    language: {
        kinds: [] as Array<string | string[]>,
        missing: [] as string[],
    },
    year: {
        kinds: [] as string[],
        missing: [] as string[],
    },
    // genre: {
    //     kinds: [] as string[],
    //     missing: [] as string[],
    // },
};

type Data = typeof data;

const index: SongPreview[] = require('../public/songs/index.json');

index.forEach((song) => {
    Object.entries(data).forEach(([key, val]) => {
        if (key in song && !!song[key as keyof Data]) {
            const toPush = song[key as keyof Data];
            val.kinds = val.kinds.concat(Array.isArray(toPush) ? toPush : [toPush!]);
        } else {
            val.missing.push(song.file);
        }
    });
});
Object.entries(data).forEach(([key, val]) => {
    val.kinds = uniq(val.kinds);
});

console.log(JSON.stringify(data, undefined, 2));
