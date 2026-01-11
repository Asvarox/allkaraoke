import { expect, test } from '@playwright/test';
import convertTxtToSong from '~/modules/Songs/utils/convertTxtToSong';
import getSongId from '~/modules/Songs/utils/getSongId';
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
const FINAL_ARTIST_ORIGIN = 'PL';
const FINAL_YEAR = '2000';
const FINAL_SONG_BPM = '100';
const FINAL_SOURCE_URL = 'https://example.com/source-url';
const FINAL_AUTHOR = 'Author E2E Test';
const FINAL_AUTHOR_URL = 'https://example.com/author-url';
const FINAL_VIDEO_GAP = '40';
const FINAL_LYRICS_GAP = '4000';
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

const videoGapShift = '10';
const lyricsGapShift = '1000';
const entranceLyricsGapShift = '10000';
const trackNum1 = 1;
const trackNum2 = 2;
const trackNum2Line = 'Second·Track';
const line1 = 0;
const line2 = 1;
const line3 = 2;
const line4 = 3;
const line10 = 9;
const autoGenLine2Value = '20';
const changedLine2Value = '40';
const autoGenLine3Value = '56';
const changedLine3Value = '76';
const autoGenLine4Value = '103';

test('Convert song', async ({ page }) => {
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.mainMenuPage.goToManageSongs();
  await pages.manageSongsPage.goToEditSongs();

  await test.step('Enter basic song info', async () => {
    await pages.editSongsPage.goToConvertSong();
    await expect(pages.songEditBasicInfoPage.pageContainer).toBeVisible();
    await expect(pages.songEditBasicInfoPage.previousButton).toBeDisabled();
    await pages.songEditBasicInfoPage.enterSourceURL(FINAL_SOURCE_URL);
    await pages.songEditBasicInfoPage.enterSongTXT(txtfile);
  });

  await test.step('Change steps', async () => {
    await pages.songEditBasicInfoPage.goToAuthorAndVideoStep();
    await expect(pages.songEditAuthorAndVideoPage.pageContainer).toBeVisible();
    await expect(pages.songEditAuthorAndVideoPage.previousButton).toBeEnabled();

    await pages.songEditAuthorAndVideoPage.goBackToBasicInfoStep();
    await expect(pages.songEditBasicInfoPage.pageContainer).toBeVisible();
    await expect(pages.songEditBasicInfoPage.previousButton).toBeDisabled();
  });

  await test.step('Enter inputs in author and video step', async () => {
    await pages.songEditBasicInfoPage.goToAuthorAndVideoStep();
    await expect(pages.songEditAuthorAndVideoPage.videoLookupButton).toBeEnabled();
    await pages.songEditAuthorAndVideoPage.enterAuthorName(FINAL_AUTHOR);
    await pages.songEditAuthorAndVideoPage.enterAuthorURL(FINAL_AUTHOR_URL);
    await pages.songEditAuthorAndVideoPage.enterVideoURL(`https://www.youtube.com/watch?v=${VIDEO_ID}`);
  });

  await test.step('Make sure entered in previous step data stays', async () => {
    await pages.songEditAuthorAndVideoPage.goToSyncLyricsStep();
    await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
    await pages.songEditSyncLyricsToVideoPage.goBackToAuthorAndVideoStep();
    await expect(pages.songEditAuthorAndVideoPage.pageContainer).toBeVisible();
    await expect(pages.songEditAuthorAndVideoPage.videoUrlInput).toHaveValue(
      `https://www.youtube.com/watch?v=${VIDEO_ID}`,
    );
    await expect(pages.songEditAuthorAndVideoPage.authorNameInput).toHaveValue(FINAL_AUTHOR);

    await pages.songEditAuthorAndVideoPage.goToSyncLyricsStep();
  });

  await test.step('Time seek controls', async () => {
    const timeControls = ['+0.5', '+1', '+5', '+10', '-0.5', '-1', '-5', '-10'];

    for (const control of timeControls) {
      await pages.songEditSyncLyricsToVideoPage.timeSeekControls(control);
      await page.waitForTimeout(50);
    }
  });

  await test.step('Set playback speed controls', async () => {
    const speedControls = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

    for (const control of speedControls) {
      await pages.songEditSyncLyricsToVideoPage.setPlaybackSpeedControls(control);
      await pages.songEditSyncLyricsToVideoPage.expectCurrentPlaybackSpeedToBe(control);
    }
  });

  await test.step('Change video gap shift controls - video gap indicates lyrics gap value', async () => {
    const entranceVideoGapShift = '0';
    const videoGapControls = ['+1', '+5', '+10', '-1', '-5', '-10'];

    let previousValue = Number(entranceVideoGapShift);
    for (const control of videoGapControls) {
      previousValue = +control + previousValue;
      await pages.songEditSyncLyricsToVideoPage.changeVideoGapShiftBy(control);
      await expect(pages.songEditSyncLyricsToVideoPage.videoGapShiftInput).toHaveValue(String(previousValue));
    }
    await pages.songEditSyncLyricsToVideoPage.enterVideoGapShift(videoGapShift);
    await expect(pages.songEditSyncLyricsToVideoPage.lyricsGapShiftInput).toHaveValue(entranceLyricsGapShift);
  });

  await test.step('Change lyrics gap shift controls - enter new value', async () => {
    const gapControls = ['+0.05', '+0.5', '+1', '-0.05', '-0.5', '-1'];

    let previousValue = Number(entranceLyricsGapShift);
    for (const control of gapControls) {
      previousValue = +control * 1000 + previousValue;
      await pages.songEditSyncLyricsToVideoPage.changeLyricsGapShiftBy(control);
      await expect(pages.songEditSyncLyricsToVideoPage.lyricsGapShiftInput).toHaveValue(String(previousValue));
    }
    await pages.songEditSyncLyricsToVideoPage.enterLyricsGapShift(lyricsGapShift);
  });

  await test.step('Entering desired song end time indicates estimated tempo BPM of the lyrics', async () => {
    const endTime = '29575';

    await pages.songEditSyncLyricsToVideoPage.enterDesiredSongEndTime(endTime); // Initial value + final gap / 2
    await expect(pages.songEditSyncLyricsToVideoPage.estProperTempoBpmElement).toContainText(FINAL_BPM);
    await pages.songEditSyncLyricsToVideoPage.enterLyricsBPM(FINAL_BPM);
  });

  await test.step('Go to track number 2', async () => {
    await pages.songEditSyncLyricsToVideoPage.goToSongTrack(trackNum2);
    await expect(pages.songEditSyncLyricsToVideoPage.getTrackButton(trackNum2)).toBeDisabled();
    await pages.songEditSyncLyricsToVideoPage.enterSongTrackName(TRACK_2_NAME);
    await expect(pages.songEditSyncLyricsToVideoPage.getTextLineElement(line1)).toContainText(trackNum2Line);
  });

  await test.step('Go to track number 1', async () => {
    await pages.songEditSyncLyricsToVideoPage.goToSongTrack(trackNum1);
    await expect(pages.songEditSyncLyricsToVideoPage.getTextLineElement(line1)).not.toContainText(trackNum2Line);
    await pages.songEditSyncLyricsToVideoPage.clickOnTextLine(line1);
    await expect(pages.songEditSyncLyricsToVideoPage.useGapInfo).toBeVisible();
  });

  await test.step('Moving a section changes the time of subsequent sections', async () => {
    await pages.songEditSyncLyricsToVideoPage.clickOnTextLine(line2);
    await expect(pages.songEditSyncLyricsToVideoPage.changeStartBeatInput).toHaveValue(autoGenLine2Value);
    await pages.songEditSyncLyricsToVideoPage.enterStartBeat(changedLine2Value);
    await pages.songEditSyncLyricsToVideoPage.clickOnTextLine(line3);
    await expect(pages.songEditSyncLyricsToVideoPage.changeStartBeatInput).toHaveValue(changedLine3Value);
  });

  await test.step('Undo the last change', async () => {
    await pages.songEditSyncLyricsToVideoPage.undoLastChange();
    await expect(pages.songEditSyncLyricsToVideoPage.changeStartBeatInput).toHaveValue(autoGenLine3Value);
    await pages.songEditSyncLyricsToVideoPage.clickOnTextLine(line2);
    await expect(pages.songEditSyncLyricsToVideoPage.changeStartBeatInput).toHaveValue(autoGenLine2Value);
  });

  await test.step('Deleting a section doesnt change the time of subsequent sections', async () => {
    await pages.songEditSyncLyricsToVideoPage.clickOnTextLine(line3);
    const textLine3 = await pages.songEditSyncLyricsToVideoPage.getTextLineElement(line3).innerText();

    await expect(pages.songEditSyncLyricsToVideoPage.getTextLineElement(line3)).toContainText(textLine3);
    await pages.songEditSyncLyricsToVideoPage.deleteTextLine();
    await expect(pages.songEditSyncLyricsToVideoPage.getTextLineElement(line3)).not.toContainText(textLine3);
    await expect(pages.songEditSyncLyricsToVideoPage.changeStartBeatInput).toHaveValue(autoGenLine4Value); // on line3

    await pages.songEditSyncLyricsToVideoPage.undoLastChange();
    await expect(pages.songEditSyncLyricsToVideoPage.getTextLineElement(line3)).toContainText(textLine3);
    await pages.songEditSyncLyricsToVideoPage.clickOnTextLine(line4);
    await expect(pages.songEditSyncLyricsToVideoPage.changeStartBeatInput).toHaveValue(autoGenLine4Value);

    await pages.songEditSyncLyricsToVideoPage.clickOnTextLine(line10);
    await pages.songEditSyncLyricsToVideoPage.deleteTextLine();
  });

  await test.step('Make sure entered in previous step data stays', async () => {
    await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
    await pages.songEditMetadataPage.goBackToSyncLyricsStep();
    await expect(pages.songEditSyncLyricsToVideoPage.videoGapShiftInput).toHaveValue(videoGapShift);
    await expect(pages.songEditSyncLyricsToVideoPage.lyricsGapShiftInput).toHaveValue(lyricsGapShift);
    await expect(pages.songEditSyncLyricsToVideoPage.changeLyricsBpmInput).toHaveValue(FINAL_BPM);
  });

  await test.step('Enter song metadata', async () => {
    const autoGenName = 'convert';
    const autoGenTitle = 'test';
    const autoGenGenre = 'genre';
    const autoGenYear = '1992';
    const autoGenSongBPM = '200';

    await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
    await expect(pages.songEditMetadataPage.pageContainer).toBeVisible();
    await expect(pages.songEditMetadataPage.songArtistInput).toHaveValue(autoGenName);
    await pages.songEditMetadataPage.enterSongArtist(FINAL_ARTIST);

    await expect(pages.songEditMetadataPage.songTitleInput).toHaveValue(autoGenTitle);
    await pages.songEditMetadataPage.enterSongTitle(FINAL_TITLE);

    await expect(pages.songEditMetadataPage.songGenreInput).toHaveValue(autoGenGenre);
    await pages.songEditMetadataPage.enterSongGenre(FINAL_GENRE);

    await expect(pages.songEditMetadataPage.songLanguageElement).toContainText(FINAL_LANG[0]);
    await pages.songEditMetadataPage.enterSongLanguage(FINAL_LANG[1]);
    await page.keyboard.press('Enter');

    await expect(pages.songEditMetadataPage.artistOriginInput).toHaveValue('US');
    await pages.songEditMetadataPage.enterArtistOrigin(FINAL_ARTIST_ORIGIN);
    await expect(pages.songEditMetadataPage.artistOriginInput).toHaveValue(FINAL_ARTIST_ORIGIN);

    await expect(pages.songEditMetadataPage.releaseYearInput).toHaveValue(autoGenYear);
    await pages.songEditMetadataPage.enterReleaseYear(FINAL_YEAR);

    await expect(pages.songEditMetadataPage.bpmSongInput).toHaveValue(autoGenSongBPM);
    await pages.songEditMetadataPage.enterSongBPM(FINAL_SONG_BPM);
  });

  await test.step('Set start and end point of the song preview', async () => {
    await expect(pages.songEditMetadataPage.startOfSongPreview).toHaveValue(String(+FINAL_VIDEO_GAP + 60));
    await expect(pages.songEditMetadataPage.endOfSongPreview).toHaveValue(String(+FINAL_VIDEO_GAP + 60 + 30));

    await pages.songEditMetadataPage.setStartOfSongPreview(FINAL_PREVIEW_START);
    await pages.songEditMetadataPage.setEndOfSongPreview(FINAL_PREVIEW_END);
  });

  await test.step('Set song volume', async () => {
    const autoGenVolume = '1';

    await expect(pages.songEditMetadataPage.currentSongVolumeLevel).toHaveValue(autoGenVolume);
    await pages.songEditMetadataPage.setTheVolumeOfTheSong(FINAL_VOLUME);
  });

  await test.step('Disagree to share added song with other players', async () => {
    await expect(pages.songEditMetadataPage.saveButton).toBeVisible();
    await pages.songEditMetadataPage.saveAndGoToEditSongsPage();
    await pages.editSongsPage.disagreeToShareAddSongs();
    await expect(pages.editSongsPage.shareSongSwitch).not.toBeChecked();
  });

  // download converted song - settings
  const convertedSongId = getSongId({ artist: FINAL_ARTIST, title: FINAL_TITLE });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    pages.editSongsPage.downloadSong(convertedSongId),
  ]);

  const downloadStream = await download.createReadStream();
  const chunks = [];
  if (downloadStream === null) throw new Error('File download failed');

  for await (const chunk of downloadStream) {
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
  expect(convertedSong.artistOrigin).toEqual(FINAL_ARTIST_ORIGIN);
  expect(convertedSong.realBpm).toEqual(+FINAL_SONG_BPM);
  expect(convertedSong.videoGap).toEqual(+FINAL_VIDEO_GAP);
  expect(convertedSong.gap).toEqual(+FINAL_LYRICS_GAP);
  expect(convertedSong.bpm).toEqual(+FINAL_BPM);
  expect(convertedSong.volume).toEqual(+FINAL_VOLUME);
  expect(convertedSong.tracks).toHaveLength(FINAL_TRACKS);
  expect(convertedSong.previewStart).toEqual(+FINAL_PREVIEW_START);
  expect(convertedSong.previewEnd).toEqual(+FINAL_PREVIEW_END);
  expect(convertedSong.tracks[0].sections).toHaveLength(FINAL_TRACK_1_SECTIONS);
  expect(convertedSong.tracks[0].name).not.toBeDefined();
  expect(convertedSong.tracks[1].name).toEqual(TRACK_2_NAME);

  await test.step('Duplicate song alert when adding the same song', async () => {
    await pages.editSongsPage.goToConvertSong();
    await pages.songEditBasicInfoPage.enterSongTXT(downloadedContent);
    await expect(pages.songEditBasicInfoPage.duplicateSongAlert).toBeVisible();
    await page.goBack();
  });

  await test.step('Delete converted song', async () => {
    page.on('dialog', (dialog) => dialog.accept());
    await pages.editSongsPage.deleteSong(convertedSongId);
    await expect(pages.editSongsPage.deleteSongButton(convertedSongId)).not.toBeVisible();
  });
});
