import addHeadstart from 'Songs/utils/processSong/addHeadstart';
import fixVideoGap from 'Songs/utils/processSong/fixVideoGap';
import normaliseGap from 'Songs/utils/processSong/normaliseGap';
import normaliseLyricSpaces from 'Songs/utils/processSong/normaliseLyricSpaces';
import normaliseSectionPaddings from 'Songs/utils/processSong/normaliseSectionPaddings';
import { Song } from 'interfaces';

export const processSong = (song: Song) => {
  let processed = normaliseGap(song);
  processed = addHeadstart(processed);
  processed = normaliseSectionPaddings(processed);
  processed = normaliseLyricSpaces(processed);
  processed = fixVideoGap(processed);

  return processed;
};
