function generateLangMap() {
  const langNames = new Intl.DisplayNames(['en'], { type: 'language' });
  const langMap: Record<string, string> = {};
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 26; j++) {
      let code = String.fromCharCode(97 + i) + String.fromCharCode(97 + j);
      let name = langNames.of(code);
      if (name !== code && name !== undefined) {
        langMap[name] = code;
      }
    }
  }
  const langMap2: Record<string, string> = {
    // Avoid using deprecated codes:
    Akan: 'ak',
    Hebrew: 'he',
    Indonesian: 'id',
    Javanese: 'jv',
    Romanian: 'ro',
    Yiddish: 'yi',
    // Optional extras:
    Tagalog: 'tl',
    English: 'gb',
    Korean: 'kr',
    Swedish: 'se',
    Latin: 'va',
    Japanese: 'jp',
    Catalan: 'cat', // by default, it's `ca` which conflicts with Canadian French
  };
  return { ...langMap, ...langMap2 };
}

// Usage:
const langMap = generateLangMap();

export default function (language: string) {
  return langMap[language];
}
