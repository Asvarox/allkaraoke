import { expect, test } from '@playwright/test';
import { Song } from '../src/interfaces';
import convertTxtToSong from '../src/Songs/utils/convertTxtToSong';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

const VIDEO_ID = '8YKAHgwLEMg';
const FINAL_LANG = 'Polish';
const FINAL_YEAR = '2000';
const FINAL_SONG_BPM = '100';
const FINAL_SOURCE_URL = 'https://example.com/source-url';
const FINAL_AUTHOR = 'Author E2E Test';
const FINAL_AUTHOR_URL = 'https://example.com/author-url';
const FINAL_VIDEO_GAP = '40';
const FINAL_GAP = '4000';
const FINAL_BPM = '200';
const FINAL_TRACKS = 2;
const FINAL_TRACK_1_SECTIONS = 10;
const FINAL_VOLUME = '0.75';
const TRACK_2_NAME = 'Track 2 Name';

test('Convert song', async ({ page }) => {
    test.slow();
    await page.goto('/?e2e-test');
    await page.getByTestId('skip').click({ force: true });
    await page.getByTestId('manage-songs').click();
    await page.getByTestId('edit-songs').click();
    await page.getByTestId('convert-song').click();

    await expect(page.getByTestId('basic-data')).toBeVisible();
    await expect(page.getByTestId('previous-button')).toBeDisabled();

    await page.locator('[data-test="source-url"] input').fill(FINAL_SOURCE_URL);

    await page.getByTestId('input-txt').fill(txtfile);

    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('basic-data')).not.toBeVisible();
    await expect(page.getByTestId('previous-button')).not.toBeDisabled();
    await expect(page.getByTestId('author-and-vid')).toBeVisible();

    await page.getByTestId('previous-button').click();
    await expect(page.getByTestId('basic-data')).toBeVisible();
    await expect(page.getByTestId('author-and-vid')).not.toBeVisible();
    await expect(page.getByTestId('previous-button')).toBeDisabled();
    await page.getByTestId('next-button').click();

    // Author and vid
    await expect(page.getByTestId('search-video')).not.toBeDisabled();

    await page.locator('[data-test="author-name"] input').fill(FINAL_AUTHOR);

    await page.locator('[data-test="author-url"] input').fill(FINAL_AUTHOR_URL);

    await page.locator('[data-test="video-url"] input').fill(`https://www.youtube.com/watch?v=${VIDEO_ID}`);

    // Make sure the data stays
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('author-and-vid')).not.toBeVisible();
    await page.getByTestId('previous-button').click();
    await expect(page.getByTestId('author-and-vid')).toBeVisible();
    await expect(page.locator('[data-test="video-url"] input')).toHaveValue(
        `https://www.youtube.com/watch?v=${VIDEO_ID}`,
    );
    await page.getByTestId('next-button').click();

    // Sync lyrics
    // Playback control
    const timeControls = ['+0.5', '+1', '+5', '+10', '-0.5', '-1', '-5', '-10'];

    for (const control of timeControls) {
        await page.locator(`[data-test="seek${control}s"]`).click();
        await page.waitForTimeout(50);
    }
    const speedControls = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
    for (const control of speedControls) {
        await page.locator(`[data-test="speed-${control}"]`).click();
        await expect(page.getByTestId('current-speed')).toHaveText(`${control * 100}%`);
    }
    // Video gap
    const videoGapControls = ['+1', '+5', '+10', '-1', '-5', '-10'];
    {
        let previousValue = 0;
        for (const control of videoGapControls) {
            previousValue = +control + previousValue;
            await page.locator(`[data-test="shift-video-gap${control}s"]`).click();
            await expect(page.locator('[data-test="shift-video-gap"] input')).toHaveValue(String(previousValue));
        }
    }
    await page.locator('[data-test="shift-video-gap"] input').fill('10');

    // Lyrics gap
    const gapControls = ['+0.05', '+0.5', '+1', '-0.05', '-0.5', '-1'];
    {
        let previousValue = 0;
        for (const control of gapControls) {
            previousValue = +control * 1000 + previousValue;
            await page.locator(`[data-test="shift-gap${control}s"]`).click();
            await expect(page.locator('[data-test="shift-gap"] input')).toHaveValue(String(previousValue));
        }
    }
    await page.locator('[data-test="shift-gap"] input').fill('1000');

    // BPM Manipulation
    await page.locator('[data-test="desired-end"] input').fill('29575'); // Initial value + final gap / 2
    await expect(page.getByTestId('desired-bpm')).toContainText('200');

    await page.locator('[data-test="change-bpm"] input').fill(FINAL_BPM);

    // Edit sections
    await page.getByTestId('track-2').click();
    await page.locator('[data-test=track-name] input').fill(TRACK_2_NAME);
    await expect(page.getByTestId('section-0')).toContainText('Second Track');

    await page.getByTestId('track-1').click();
    await expect(page.getByTestId('section-0')).not.toContainText('Second Track');
    await page.getByTestId('section-0').click();
    await expect(page.getByTestId('use-gap-info')).toBeVisible();

    // Moving a section changes the time of subsequent sections
    await page.getByTestId('section-1').click();
    await page.locator('[data-test="change-start-beat"] input').fill('40');
    await page.getByTestId('section-2').click();
    await expect(page.locator('[data-test="change-start-beat"] input')).toHaveValue('76');
    await page.getByTestId('undo-change').click();
    await expect(page.locator('[data-test="change-start-beat"] input')).toHaveValue('56');

    // Deleting a section doesn't change the time of subsequent sections
    await page.getByTestId('delete-section').click();
    await expect(page.locator('[data-test="change-start-beat"] input')).toHaveValue('103'); // next section
    await page.getByTestId('undo-change').click();
    await page.getByTestId('section-3').click();
    await expect(page.locator('[data-test="change-start-beat"] input')).toHaveValue('103'); // next section

    await page.getByTestId('section-9').click();
    await page.getByTestId('delete-section').click();

    await page.getByTestId('next-button').click();
    await page.getByTestId('previous-button').click();

    await expect(page.locator('[data-test="shift-video-gap"] input')).toHaveValue('10');
    await expect(page.locator('[data-test="shift-gap"] input')).toHaveValue('1000');
    await expect(page.locator('[data-test="change-bpm"] input')).toHaveValue(FINAL_BPM);

    await page.getByTestId('next-button').click();

    // Song metadata
    await expect(page.locator('[data-test="song-language"] input')).toHaveValue('English');
    await page.locator('[data-test="song-language"] input').fill(FINAL_LANG);

    await expect(page.locator('[data-test="release-year"] input')).toHaveValue('1992');
    await page.locator('[data-test="release-year"] input').fill(FINAL_YEAR);

    await page.locator('[data-test="song-bpm"] input').fill(FINAL_SONG_BPM);
    await page.locator('[data-test="volume"] input').fill(FINAL_VOLUME);

    // Download song
    await expect(page.getByTestId('next-button')).not.toBeVisible();
    await expect(page.getByTestId('save-button')).toBeVisible();
    await page.getByTestId('save-button').click();

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('[data-test="download-song"][data-song="convert-test.json"]').click(),
    ]);

    const downloadStream = await download.createReadStream();
    const chunks = [];
    if (downloadStream === null) throw new Error('File download failed');

    for await (let chunk of downloadStream) {
        chunks.push(chunk);
    }
    const downloadContent: Song = convertTxtToSong(Buffer.concat(chunks).toString('utf-8'));

    expect(downloadContent.video).toEqual(VIDEO_ID);
    expect(downloadContent.sourceUrl).toEqual(FINAL_SOURCE_URL);
    expect(downloadContent.author).toEqual(FINAL_AUTHOR);
    expect(downloadContent.authorUrl).toEqual(FINAL_AUTHOR_URL);
    expect(downloadContent.language).toEqual(FINAL_LANG);
    expect(downloadContent.year).toEqual(FINAL_YEAR);
    expect(downloadContent.realBpm).toEqual(+FINAL_SONG_BPM);
    expect(downloadContent.videoGap).toEqual(+FINAL_VIDEO_GAP);
    expect(downloadContent.gap).toEqual(+FINAL_GAP);
    expect(downloadContent.bpm).toEqual(+FINAL_BPM);
    expect(downloadContent.volume).toEqual(+FINAL_VOLUME);
    expect(downloadContent.tracks).toHaveLength(FINAL_TRACKS);
    expect(downloadContent.tracks[0].sections).toHaveLength(FINAL_TRACK_1_SECTIONS);
    expect(downloadContent.tracks[0].name).not.toBeDefined();
    expect(downloadContent.tracks[1].name).toEqual(TRACK_2_NAME);

    page.on('dialog', (dialog) => dialog.accept());

    await page.locator('[data-test="delete-song"][data-song="convert-test.json"]').click();
    await expect(page.locator('[data-test="delete-song"][data-song="convert-test.json"]')).not.toBeVisible();
});

const txtfile = `
#TITLE:test
#ARTIST:convert
#LANGUAGE:English
#YEAR:1992
#VIDEOGAP:30
#BPM:100
#GAP:3000
: 7 4 59 When
: 11 4 59  you're
- 20
: 20 4 59 And
: 24 4 59  life
: 28 4 59  is
: 32 4 61  mak
: 36 4 64 ing
: 40 4 61  you
: 44 8 59  lone
: 52 3 63 ly
- 56
: 56 4 66 You
: 60 4 63  can
: 64 4 64  al
: 68 7 68 ways
: 75 12 59  go
- 90
: 103 8 64 Down
: 111 8 59 town
- 121
: 127 4 59 When
: 131 4 59  you've
: 135 4 59  got
: 139 7 59  wor
: 146 3 59 ries
- 150
: 150 4 59 All
: 154 4 59  the
: 158 4 61  noise
: 162 4 64  and
: 166 4 61  the
: 170 8 59  hur
: 178 3 63 ry
- 182
: 182 4 66 Seems
: 186 4 63  to
: 190 4 64  help
: 194 8 68  I
: 202 12 59  know
: 230 8 64  down
: 238 8 59 town
- 248
: 250 4 59 Just
: 254 4 69  li
: 258 4 68 sten
: 262 4 68  to
: 266 4 66  the
: 270 4 69  mu
: 274 3 68 sic
- 278
: 278 4 68 Of
: 282 4 66  the
: 286 4 64  traf
: 290 4 66 fic
: 294 4 64  in
: 298 4 63  the
: 302 2 61  ci
: 304 6 64 ty
- 312
: 318 4 69 Lin
: 322 4 68 ger
: 326 4 68  on
: 330 4 66  the
: 334 4 69  side
: 338 3 68 walk
: 7 4 59 Second
: 11 4 59  Track
`;
