import { Song } from '~/interfaces';
import addHeadstart from '~/modules/songs/utils/process-song/add-headstart';
import fixVideoGap from '~/modules/songs/utils/process-song/fix-video-gap';
import keepInstrumentalInSync from '~/modules/songs/utils/process-song/keep-instrumental-in-sync';
import normaliseGap from '~/modules/songs/utils/process-song/normalise-gap';
import normaliseLyricSpaces from '~/modules/songs/utils/process-song/normalise-lyric-spaces';
import normaliseSectionPaddings from '~/modules/songs/utils/process-song/normalise-section-paddings';

/** To play the instrumental, swap it in before processing (see loadSongById) so its own gaps get normalised */
export const processSong = (song: Song) => {
  let processed = keepInstrumentalInSync(song, (original) => addHeadstart(normaliseGap(original)));
  processed = normaliseSectionPaddings(processed);
  processed = normaliseLyricSpaces(processed);
  processed = fixVideoGap(processed);

  return processed;
};
