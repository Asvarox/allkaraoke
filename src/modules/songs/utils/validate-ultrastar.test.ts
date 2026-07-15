import { describe, expect, it } from 'vitest';

import isValidUltrastarTxtFormat from './validate-ultrastar';

const validSongTxt = `
#ARTIST:Artist
#TITLE:Title
#BPM:60
#LANGUAGE:English
#GAP:0
: 0 1 0 la
- 1
: 1 1 0 la
E
`;

const invalidSongTxt = `
#ARTIST:Victorious Cast
#TITLE:Shut Up n' Dance
#BPM:223
#LANGUAGE:English
#GAP:6353,031390134529
: 15 7 80 It's nine on the dot
R 15 9 24 And we just talk and we talk
: 15 10 93 And I just want it to stop
: NaN NaN NaN we here for the music?
E
`;

describe('isValidUltrastarTxtFormat', () => {
  it('accepts valid Ultrastar txt', () => {
    expect(isValidUltrastarTxtFormat(validSongTxt)).toBe(true);
  });

  it('rejects songs with non-finite note values', () => {
    expect(isValidUltrastarTxtFormat(invalidSongTxt)).toBe(false);
  });
});
