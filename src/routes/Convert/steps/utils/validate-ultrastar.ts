import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';

export default function isValidUltrastarTxtFormat(songTxt: string) {
  const lines = songTxt.split('\n');
  const requiredTags = ['#TITLE', '#ARTIST', '#BPM'];

  for (const tag of requiredTags) {
    if (!lines.some((line) => line.startsWith(tag))) {
      return false;
    }
  }

  // Checking if there exist any song notes or not
  if (!lines.some((line) => line.startsWith(':'))) {
    return false;
  }

  try {
    convertTxtToSong(songTxt);
  } catch (e) {
    console.log(e);
    return false;
  }

  return true;
}
