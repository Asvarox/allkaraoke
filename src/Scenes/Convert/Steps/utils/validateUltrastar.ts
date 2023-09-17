export default function isValidUltrastarTxtFormat(songTxt: string) {
  const lines = songTxt.split('\n');
  const requiredTags = ['#TITLE', '#ARTIST', '#BPM'];
  let isValid = true;

  requiredTags.forEach((tag) => {
    if (!lines.some((line) => line.startsWith(tag))) {
      isValid = false;
    }
  });

  // Checking if there exist any song notes or not
  if (!lines.some((line) => line.startsWith(':'))) {
    isValid = false;
  }

  return isValid;
}
