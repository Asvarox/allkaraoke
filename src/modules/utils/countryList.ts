function generateCountryMap() {
  const A = 65;
  const Z = 90;
  const countryName = new Intl.DisplayNames(['en'], { type: 'region' });
  const countries: Record<string, string> = {};
  for (let i = A; i <= Z; ++i) {
    for (let j = A; j <= Z; ++j) {
      let code = String.fromCharCode(i) + String.fromCharCode(j);
      let name = countryName.of(code);
      if (name && code !== name) {
        countries[name] = code;
      }
    }
  }
  const langMap2: Record<string, string> = {};

  return { ...countries, ...langMap2 };
}

// Usage:
export const countryMap = generateCountryMap();
