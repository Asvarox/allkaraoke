import { expect, test } from '@playwright/test';
import convertTxtToSong from 'Songs/utils/convertTxtToSong';
import getSongId from 'Songs/utils/getSongId';
import { txtfile } from './fixtures/newsongtxt';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page, context }) => {
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const VIDEO_ID = '8YKAHgwLEMg';
const FINAL_LANG = ['English', 'Polish'];
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
const FINAL_ARTIST = 'Final Artist';
const FINAL_TITLE = 'Final Title';
const FINAL_GENRE = 'Final Genre';
const FINAL_PREVIEW_START = '60';
const FINAL_PREVIEW_END = '80';

test('Convert song', async ({ page }) => {
  test.slow();
  await page.goto('/?e2e-test');
  await page.getByTestId('skip').click();
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
  await expect(page.locator('[data-test="video-url"] button')).not.toBeDisabled();

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
  await expect(page.locator('[data-test="shift-gap"] input')).toHaveValue('10000');

  // Lyrics gap
  const gapControls = ['+0.05', '+0.5', '+1', '-0.05', '-0.5', '-1'];
  {
    let previousValue = 10000;
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
  await expect(page.locator('[data-test="song-artist"] input')).toHaveValue('convert');
  await page.locator('[data-test="song-artist"] input').fill(FINAL_ARTIST);

  await expect(page.locator('[data-test="song-title"] input')).toHaveValue('test');
  await page.locator('[data-test="song-title"] input').fill(FINAL_TITLE);

  await expect(page.locator('[data-test="song-genre"] input')).toHaveValue('genre');
  await page.locator('[data-test="song-genre"] input').fill(FINAL_GENRE);

  await expect(page.locator('[data-test="song-language"]')).toContainText(FINAL_LANG[0]);
  await page.locator('[data-test="song-language"] input').fill(FINAL_LANG[1]);
  await page.keyboard.press('Enter');

  await expect(page.locator('[data-test="release-year"] input')).toHaveValue('1992');
  await page.locator('[data-test="release-year"] input').fill(FINAL_YEAR);

  await expect(page.locator('[data-test="song-bpm"] input')).toHaveValue('200');
  await page.locator('[data-test="song-bpm"] input').fill(FINAL_SONG_BPM);

  await expect(page.locator('[data-test=song-preview] input[data-index="0"]')).toHaveValue(
    String(+FINAL_VIDEO_GAP + 60),
  );
  await expect(page.locator('[data-test=song-preview] input[data-index="1"]')).toHaveValue(
    String(+FINAL_VIDEO_GAP + 60 + 30),
  );
  await page.locator('[data-test=song-preview] input[data-index="0"]').fill(FINAL_PREVIEW_START);
  await page.locator('[data-test=song-preview] input[data-index="1"]').fill(FINAL_PREVIEW_END);

  await expect(page.locator('[data-test="volume"] input')).toHaveValue('0.25');
  await page.locator('[data-test="volume"] input').fill(FINAL_VOLUME);

  // Download song
  await expect(page.getByTestId('next-button')).not.toBeVisible();
  await expect(page.getByTestId('save-button')).toBeVisible();
  await page.getByTestId('save-button').click();

  const convertedSongId = getSongId({ artist: FINAL_ARTIST, title: FINAL_TITLE });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator(`[data-test="download-song"][data-song="${convertedSongId}"]`).click(),
  ]);

  const downloadStream = await download.createReadStream();
  const chunks = [];
  if (downloadStream === null) throw new Error('File download failed');

  for await (let chunk of downloadStream) {
    chunks.push(chunk);
  }

  const downloadedContent = Buffer.concat(chunks).toString('utf-8');
  const convertedSong = convertTxtToSong(downloadedContent);

  expect(convertedSong.artist).toEqual(FINAL_ARTIST);
  expect(convertedSong.title).toEqual(FINAL_TITLE);
  expect(convertedSong.genre).toEqual(FINAL_GENRE);
  expect(convertedSong.video).toEqual(VIDEO_ID);
  expect(convertedSong.sourceUrl).toEqual(FINAL_SOURCE_URL);
  expect(convertedSong.author).toEqual(FINAL_AUTHOR);
  expect(convertedSong.authorUrl).toEqual(FINAL_AUTHOR_URL);
  expect(convertedSong.language).toContain(FINAL_LANG[0]);
  expect(convertedSong.language).toContain(FINAL_LANG[1]);
  expect(convertedSong.year).toEqual(FINAL_YEAR);
  expect(convertedSong.realBpm).toEqual(+FINAL_SONG_BPM);
  expect(convertedSong.videoGap).toEqual(+FINAL_VIDEO_GAP);
  expect(convertedSong.gap).toEqual(+FINAL_GAP);
  expect(convertedSong.bpm).toEqual(+FINAL_BPM);
  expect(convertedSong.volume).toEqual(+FINAL_VOLUME);
  expect(convertedSong.tracks).toHaveLength(FINAL_TRACKS);
  expect(convertedSong.previewStart).toEqual(+FINAL_PREVIEW_START);
  expect(convertedSong.previewEnd).toEqual(+FINAL_PREVIEW_END);
  expect(convertedSong.tracks[0].sections).toHaveLength(FINAL_TRACK_1_SECTIONS);
  expect(convertedSong.tracks[0].name).not.toBeDefined();
  expect(convertedSong.tracks[1].name).toEqual(TRACK_2_NAME);

  await page.getByTestId('convert-song').click();
  await page.getByTestId('input-txt').fill(downloadedContent);
  await expect(page.getByTestId('possible-duplicate')).toBeVisible();

  await page.goBack();

  page.on('dialog', (dialog) => dialog.accept());

  await page.locator(`[data-test="delete-song"][data-song="${convertedSongId}"]`).click();
  await expect(page.locator(`[data-test="delete-song"][data-song="${convertedSongId}"]`)).not.toBeVisible();
});
