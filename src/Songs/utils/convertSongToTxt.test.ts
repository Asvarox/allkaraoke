import convertSongToTxt from 'Songs/utils/convertSongToTxt';
import { mulitrack } from 'Songs/utils/song-fixture';

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
});
