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
};

export function fixDiacritics(txt: string, language: string): string {
  const accentSet = accents[language as any as keyof typeof accents];
  if (accentSet === undefined) return txt;

  let fixedTxt = txt;
  for (const [accent, replacement] of Object.entries(accentSet)) {
    fixedTxt = fixedTxt.replaceAll(accent, replacement);
  }

  return fixedTxt;
}
