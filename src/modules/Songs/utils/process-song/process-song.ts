import { Song } from '~/interfaces';
import addHeadstart from '~/modules/songs/utils/process-song/add-headstart';
import fixVideoGap from '~/modules/songs/utils/process-song/fix-video-gap';
import normaliseGap from '~/modules/songs/utils/process-song/normalise-gap';
import normaliseLyricSpaces from '~/modules/songs/utils/process-song/normalise-lyric-spaces';
import normaliseSectionPaddings from '~/modules/songs/utils/process-song/normalise-section-paddings';

export const processSong = (song: Song) => {
  let processed = normaliseGap(song);
  processed = addHeadstart(processed);
  processed = normaliseSectionPaddings(processed);
  processed = normaliseLyricSpaces(processed);
  processed = fixVideoGap(processed);

  return processed;
};
