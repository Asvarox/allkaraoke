const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export default function isoCodeToCountry(isoCode: string) {
  return regionNames.of(isoCode);
}
