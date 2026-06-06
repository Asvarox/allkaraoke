const accents = {
  polish: {
    È: 'é',
    í: "'",
    '¥': "'",
    '¯': 'Ż',
    '¹': 'ą',
    π: 'ą',
    ê: 'ę',
    Í: 'ę',
    Œ: 'Ś',
    å: 'Ś',
    œ: 'ś',
    ú: 'ś',
    æ: 'ć',
    Ê: 'ć',
    '¿': 'ż',
    ø: 'ż',
    Ø: 'Ż',
    ñ: 'ń',
    Ò: 'ń',
    '³': 'ł',
    '≥': 'ł',
    '£': 'Ł',
    Û: 'ó',
    ü: 'ź',
    Ÿ: 'ź',
  },
  spanish: {
    ø: '¿',
    È: 'é',
    Ì: 'í',
    Ò: 'ñ',
    ń: 'ñ',
    '·': 'á',
    Û: 'ó',
    '°': '!',
    '˙': 'ú',
    ś: 'ú',
  },
  french: {
    // Lowercase fixes
    È: 'é',
    Ë: 'è',
    '‡': 'à',
    Í: 'ê',
    ú: 'œ',
    Á: 'ç',
    '‚': 'â',
    Ó: 'î',
    Ô: 'ï',
    Ù: 'ô',
    '˚': 'û',
    '˘': 'ù',
    Î: 'ë',

    // Uppercase fixes
    '…': 'É',
    '»': 'È', // Placed after 'È' to avoid chaining
    '¿': 'À',
    Ä: 'Œ',
    '¬': 'Â',
    '¥': 'Û',
    '˜': 'Ù', // Placed after 'Ù' to avoid chaining
  },
};

export function fixDiacritics(txt: string, language: string): string {
  const accentSet = accents[language as unknown as keyof typeof accents];
  if (accentSet === undefined) return txt;

  let fixedTxt = txt;
  for (const [accent, replacement] of Object.entries(accentSet)) {
    fixedTxt = fixedTxt.replaceAll(accent, replacement);
  }

  return fixedTxt;
}
