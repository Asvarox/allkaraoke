import convertSongToTxt from 'Songs/utils/convertSongToTxt';
import { mulitrack } from 'Songs/utils/song-fixture';

describe('convertSongToTxt', () => {
  it('should properly convert the song', () => {
    expect(convertSongToTxt(mulitrack)).toMatchSnapshot();
  });
});
