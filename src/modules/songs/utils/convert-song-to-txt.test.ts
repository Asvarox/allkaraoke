import convertSongToTxt from '~/modules/songs/utils/convert-song-to-txt';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import { mulitrack } from '~/modules/songs/utils/song-fixture';

describe('convertSongToTxt', () => {
  it('should properly convert the song', () => {
    expect(convertSongToTxt(mulitrack)).toMatchSnapshot();
  });

  it('should use known metadata keys over unsupported props', () => {
    const song = { ...mulitrack, unsupportedProps: ['#TITLE:not-expected'] };

    const result = convertSongToTxt(song);

    expect(result).toContain(`#TITLE:${song.title}`);
    expect(result).not.toContain(`#TITLE:not-expected`);
  });

  it('should round-trip the instrumental version', () => {
    const instrumental = { video: 'bGn0ELQgz3I', gap: 1250.5, videoGap: 3, volume: 0.55 };

    const txt = convertSongToTxt({ ...mulitrack, instrumental });

    expect(txt).toContain('#ALLKARAOKE_INSTRUMENTALVIDEO:bGn0ELQgz3I');
    expect(txt).toContain('#ALLKARAOKE_INSTRUMENTALGAP:1250,5');
    expect(convertTxtToSong(txt).instrumental).toEqual(instrumental);
    expect(convertTxtToSong(txt).unsupportedProps).not.toContainEqual(expect.stringContaining('INSTRUMENTAL'));
  });

  it('should not write instrumental headers when there is no instrumental', () => {
    expect(convertSongToTxt(mulitrack)).not.toContain('INSTRUMENTAL');
  });
});
