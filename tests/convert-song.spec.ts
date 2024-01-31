import { expect, test } from '@playwright/test';
import convertTxtToSong from 'Songs/utils/convertTxtToSong';
import getSongId from 'Songs/utils/getSongId';
import { txtfile } from './fixtures/newsongtxt';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
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

const expectedBPM = '200';
const expectedYear = '1992';

const videoGapShift = '10';
const entranceGapShift = '10000';
const gapShift = '1000';

const trackNum1 = 1;
const trackNum2 = 2;

const line1 = 0;
const line2 = 1;
const line3 = 2;
const line4 = 3;
const line10 = 9;

test('Convert song', async ({ page }) => {
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.skipToMainMenu();
  await pages.mainMenuPage.goToManageSongs();
  await pages.manageSongsPage.goToEditSongs();

  await test.step('Enter basic song info', async () => {
    await pages.editSongsPage.goToImportUltrastar();
    await expect(pages.songEditingPage.basicSongInfoPreview).toBeVisible();
    await expect(pages.songEditingPage.previousButton).toBeDisabled();
    await pages.songEditingPage.enterSourceURL(FINAL_SOURCE_URL);
    await pages.songEditingPage.enterSongTXT(txtfile);
  });
  await test.step('Go to author and video step', async () => {
    await pages.songEditingPage.nextStep();
    await expect(pages.songEditingPage.basicSongInfoPreview).not.toBeVisible();
    await expect(pages.songEditingPage.previousButton).toBeEnabled();
    await expect(pages.songEditingPage.authorAndVideoInfoPreview).toBeVisible();
  });
  await test.step('Go back to basic song info step', async () => {
    await pages.songEditingPage.previousStep();
    await expect(pages.songEditingPage.basicSongInfoPreview).toBeVisible();
    await expect(pages.songEditingPage.authorAndVideoInfoPreview).not.toBeVisible();
    await expect(pages.songEditingPage.previousButton).toBeDisabled();
  });
  await test.step('Enter inputs in author and video step', async () => {
    // Author and vid
    await pages.songEditingPage.nextStep();
    await expect(pages.songEditingPage.videoLookupButton).toBeEnabled();
    await pages.songEditingPage.enterAuthorName(FINAL_AUTHOR);
    await pages.songEditingPage.enterAuthorURL(FINAL_AUTHOR_URL);
    await pages.songEditingPage.enterVideoURL(`https://www.youtube.com/watch?v=${VIDEO_ID}`);
  });

  await test.step('Make sure entered data stays', async () => {
    await pages.songEditingPage.nextStep();
    await expect(pages.songEditingPage.authorAndVideoInfoPreview).not.toBeVisible();
    await pages.songEditingPage.previousStep();
    await expect(pages.songEditingPage.authorAndVideoInfoPreview).toBeVisible();
    await expect(pages.songEditingPage.videoUrlInput).toHaveValue(`https://www.youtube.com/watch?v=${VIDEO_ID}`);
    await expect(pages.songEditingPage.authorNameInput).toHaveValue(FINAL_AUTHOR);

    await pages.songEditingPage.nextStep();
  });

  await test.step('Toggle time seek controls works', async () => {
    const timeControls = ['+0.5', '+1', '+5', '+10', '-0.5', '-1', '-5', '-10'];

    {
      for (const control of timeControls) {
        await page.locator(`[data-test="seek${control}s"]`).click(); // todo
        await page.waitForTimeout(50);
      }
    }
  });

  await test.step('Toggle playback speed controls works', async () => {
    const speedControls = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
    {
      for (const control of speedControls) {
        await pages.songEditingPage.togglePlaybackSpeedControls(control);
        await expect(page.getByTestId('current-speed')).toHaveText(`${control * 100}%`); //todo
      }
    }
  });

  await test.step('Toggle video gap shift controls works, enter value', async () => {
    const entranceVideoGapShift = '0';
    const videoGapControls = ['+1', '+5', '+10', '-1', '-5', '-10'];

    {
      let previousValue = Number(entranceVideoGapShift);
      for (const control of videoGapControls) {
        previousValue = +control + previousValue;
        await pages.songEditingPage.toggleVideoGapShiftControls(control);
        await expect(pages.songEditingPage.videoGapShiftInput).toHaveValue(String(previousValue));
      }
    }
    await pages.songEditingPage.enterVideoGapShift(videoGapShift);
    await expect(pages.songEditingPage.gapShiftInput).toHaveValue(entranceGapShift);
  });

  // Lyrics gap
  await test.step('Toggle gap shift controls works, enter value', async () => {
    const gapControls = ['+0.05', '+0.5', '+1', '-0.05', '-0.5', '-1'];

    {
      let previousValue = Number(entranceGapShift);
      for (const control of gapControls) {
        previousValue = +control * 1000 + previousValue;
        await pages.songEditingPage.toggleGapShiftControls(control);
        await expect(pages.songEditingPage.gapShiftInput).toHaveValue(String(previousValue));
      }
    }
    await pages.songEditingPage.enterGapShift(gapShift);
  });

  await test.step('Enter desired end time and lyrics bpm values', async () => {
    await pages.songEditingPage.enterDesiredEndTime('29575'); // Initial value + final gap / 2
    await expect(pages.songEditingPage.desiredLyricsBpmElement).toContainText('200'); // może zmienne w stepie?
    await pages.songEditingPage.enterChangedLyricsBPM(FINAL_BPM);
  });

  await test.step('Change to track number 2', async () => {
    await pages.songEditingPage.goToTrackNumber(trackNum2);
    await expect(pages.songEditingPage.trackButton(trackNum2)).toBeDisabled();
    await pages.songEditingPage.enterTrackName(TRACK_2_NAME);
    await expect(pages.songEditingPage.textLineElement(line1)).toContainText('Second Track');
  });

  await test.step('Change to track number 1', async () => {
    await pages.songEditingPage.goToTrackNumber(trackNum1);
    await expect(pages.songEditingPage.textLineElement(line1)).not.toContainText('Second Track');
    await pages.songEditingPage.clickOnTextLine(line1);
    await expect(pages.songEditingPage.useGapInfo).toBeVisible();
  });

  // Moving a section changes the time of subsequent sections
  await pages.songEditingPage.clickOnTextLine(line2);
  await pages.songEditingPage.enterStartBeat('40');

  await pages.songEditingPage.clickOnTextLine(line3);
  await expect(pages.songEditingPage.changeStartBeatInput).toHaveValue('76');
  await pages.songEditingPage.undoLastChange();

  await expect(pages.songEditingPage.changeStartBeatInput).toHaveValue('56');

  const textLine3 = await pages.songEditingPage.textLineElement(line3).innerText();

  await expect(pages.songEditingPage.textLineElement(line3)).toContainText(textLine3);

  // Deleting a section doesn't change the time of subsequent sections
  await pages.songEditingPage.deleteTextLine();
  await expect(pages.songEditingPage.textLineElement(line3)).not.toContainText(textLine3);

  await expect(pages.songEditingPage.changeStartBeatInput).toHaveValue('103'); // next section
  await pages.songEditingPage.undoLastChange();
  await expect(pages.songEditingPage.textLineElement(line3)).toContainText(textLine3);

  await pages.songEditingPage.clickOnTextLine(line4);
  await expect(pages.songEditingPage.changeStartBeatInput).toHaveValue('103'); // next section
  await pages.songEditingPage.clickOnTextLine(line10);
  await pages.songEditingPage.deleteTextLine();

  await pages.songEditingPage.nextStep();
  await pages.songEditingPage.previousStep();
  await expect(pages.songEditingPage.videoGapShiftInput).toHaveValue(videoGapShift);
  await expect(pages.songEditingPage.gapShiftInput).toHaveValue(gapShift);
  await expect(pages.songEditingPage.changeLyricsBpmInput).toHaveValue(FINAL_BPM);

  await pages.songEditingPage.nextStep();

  // Song metadata
  await expect(pages.songEditingPage.songArtistInput).toHaveValue('convert');
  await pages.songEditingPage.enterSongArtist(FINAL_ARTIST);

  await expect(pages.songEditingPage.songTitleInput).toHaveValue('test');
  await pages.songEditingPage.enterSongTitle(FINAL_TITLE);

  await expect(pages.songEditingPage.songGenreInput).toHaveValue('genre');
  await pages.songEditingPage.enterSongGenre(FINAL_GENRE);

  await expect(pages.songEditingPage.selectedLanguagePreview).toContainText(FINAL_LANG[0]);
  await pages.songEditingPage.enterSongLanguage(FINAL_LANG[1]);
  await page.keyboard.press('Enter');

  await expect(pages.songEditingPage.releaseYearInput).toHaveValue(expectedYear);
  await pages.songEditingPage.enterReleaseYear(FINAL_YEAR);

  await expect(pages.songEditingPage.bpmSongInput).toHaveValue('200'); // FINAL_BPM? Te 200...
  await pages.songEditingPage.enterSongBPM(FINAL_SONG_BPM);

  await expect(pages.songEditingPage.startOfSongPreview).toHaveValue(String(+FINAL_VIDEO_GAP + 60));
  await expect(pages.songEditingPage.endOfSongPreview).toHaveValue(String(+FINAL_VIDEO_GAP + 60 + 30));

  await pages.songEditingPage.shiftStartOfSongPreview(FINAL_PREVIEW_START);
  await pages.songEditingPage.shiftEndOfSongPreview(FINAL_PREVIEW_END);

  await expect(pages.songEditingPage.currentSongVolumeLevel).toHaveValue('0.25');
  await pages.songEditingPage.changeTheVolumeOfTheSong(FINAL_VOLUME);

  // Download song
  await expect(pages.songEditingPage.nextButton).not.toBeVisible();
  await expect(pages.songEditingPage.saveButton).toBeVisible();
  await pages.songEditingPage.saveChanges();
  await pages.editSongsPage.disagreeToShareAddSongs();
  await expect(pages.editSongsPage.shareSongSwitch).not.toBeChecked();

  const convertedSongId = getSongId({ artist: FINAL_ARTIST, title: FINAL_TITLE });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    //page.locator(`[data-test="download-song"][data-song="${convertedSongId}"]`).click(),
    pages.editSongsPage.downloadSong(convertedSongId),
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

  await pages.editSongsPage.goToImportUltrastar();
  await pages.songEditingPage.enterSongTXT(downloadedContent);
  await expect(pages.songEditingPage.duplicateSongAlert).toBeVisible();
  await page.goBack();

  page.on('dialog', (dialog) => dialog.accept());

  await pages.editSongsPage.deleteSong(convertedSongId);
  await expect(pages.editSongsPage.deleteSongButton(convertedSongId)).not.toBeVisible();
});
