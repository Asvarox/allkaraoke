import { Song } from 'interfaces';
import addHeadstart from 'modules/Songs/utils/processSong/addHeadstart';
import fixVideoGap from 'modules/Songs/utils/processSong/fixVideoGap';
import normaliseGap from 'modules/Songs/utils/processSong/normaliseGap';
import normaliseLyricSpaces from 'modules/Songs/utils/processSong/normaliseLyricSpaces';
import normaliseSectionPaddings from 'modules/Songs/utils/processSong/normaliseSectionPaddings';

export const processSong = (song: Song) => {
  let processed = normaliseGap(song);
  processed = addHeadstart(processed);
  processed = normaliseSectionPaddings(processed);
  processed = normaliseLyricSpaces(processed);
  processed = fixVideoGap(processed);

  return processed;
};
