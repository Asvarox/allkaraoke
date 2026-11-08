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

const rapOnlySongTxt = `
#ARTIST:Artist
#TITLE:Title
#BPM:60
#LANGUAGE:Polish
#GAP:0
R 0 1 0 la
- 1
G 1 1 0 la
F 2 1 0 la
E
`;

const noNotesSongTxt = `
#ARTIST:Artist
#TITLE:Title
#BPM:60
#LANGUAGE:English
#GAP:0
- 1
E
`;

const incompleteRapLineSongTxt = `
#ARTIST:Artist
#TITLE:Title
#BPM:60
#LANGUAGE:English
#GAP:0
R 
E
`;

describe('isValidUltrastarTxtFormat', () => {
  it('accepts valid Ultrastar txt', () => {
    expect(isValidUltrastarTxtFormat(validSongTxt)).toBe(true);
  });

  it('accepts songs with only rap and freestyle notes', () => {
    expect(isValidUltrastarTxtFormat(rapOnlySongTxt)).toBe(true);
  });

  it('rejects songs without any notes', () => {
    expect(isValidUltrastarTxtFormat(noNotesSongTxt)).toBe(false);
  });

  it('rejects songs whose only note line is incomplete', () => {
    expect(isValidUltrastarTxtFormat(incompleteRapLineSongTxt)).toBe(false);
  });

  it('rejects songs with non-finite note values', () => {
    expect(isValidUltrastarTxtFormat(invalidSongTxt)).toBe(false);
  });
});
