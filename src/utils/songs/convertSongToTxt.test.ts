import convertSongToTxt from 'utils/songs/convertSongToTxt';
import { mulitrack } from 'utils/songs/song-fixture';

describe('convertSongToTxt', () => {
    it('should properly convert the song', () => {
        expect(convertSongToTxt(mulitrack)).toMatchSnapshot();
    });
});
