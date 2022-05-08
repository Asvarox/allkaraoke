import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { Song } from 'interfaces';
import { MusicBrainzApi } from 'musicbrainz-api';
import { IIsrcSearchResult } from 'musicbrainz-api/lib/musicbrainz.types';
import clearString from 'utils/clearString';

const mbApi = new MusicBrainzApi({
    appName: 'Olkaraoke',
    appVersion: '0.1.0',
    appContactInfo: 'tatarczyk.aleksander@gmail.com',
});

const SONGS_FOLDER = './public/songs';

(async function () {
    const songs = readdirSync(SONGS_FOLDER);

    for (const file of songs) {
        if (file === 'index.json' || file === 'dummy.json') return;

        const { tracks, ...songData }: Song = JSON.parse(
            readFileSync(`${SONGS_FOLDER}/${file}`, { encoding: 'utf-8' }),
        );

        console.log(`"${songData.artist}" "${songData.title}"`);
        try {
            await fillSongYear(songData);
        } catch (e) {
            console.error(e);
        }

        writeFileSync(`${SONGS_FOLDER}/${file}`, JSON.stringify({ ...songData, tracks }, undefined, 2), {
            encoding: 'utf-8',
        });
    }
})();

async function fillSongYear(songData: Omit<Song, 'tracks'>) {
    if (songData.year && songData.year !== '') {
        return;
    }
    console.log('    Missing year');

    const externalData = await mbApi.search<IIsrcSearchResult>('recording', {
        query: `"${songData.artist}" "${songData.title}"`,
    });

    if (externalData.count > 0) {
        let oldestRecord = externalData.recordings[0];

        externalData.recordings.forEach((result) => {
            // @ts-expect-error
            const firstReleaseDate = result['first-release-date']?.split('-')?.[0] ?? -Infinity;
            // @ts-expect-error
            const currentOldestRelease = oldestRecord['first-release-date']?.split('-')?.[0] ?? Infinity;
            if (clearString(result.title) === clearString(songData.title) && currentOldestRelease > firstReleaseDate) {
                oldestRecord = result;
            }
        });

        // @ts-expect-error
        const currentOldestRelease = oldestRecord['first-release-date']?.split('-')?.[0];
        if (
            clearString(oldestRecord.title) === clearString(songData.title) &&
            currentOldestRelease !== undefined &&
            currentOldestRelease > 100
        ) {
            console.log('    ...', currentOldestRelease);
            songData.year = currentOldestRelease;
        } else {
            console.log(
                '    ...not found',
                currentOldestRelease,
                clearString(oldestRecord.title),
                clearString(songData.title),
            );
        }
    }
}
