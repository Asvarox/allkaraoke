import { Song } from 'interfaces';
import languageNameToIsoCode from 'utils/languageNameToIsoCode';

interface Props {
  language: Song['language'];
}
export const Flag = ({ language, ...props }: Props) => {
  const lang = Array.isArray(language) ? language[0] : language;
  const isoCode = languageNameToIsoCode(lang);

  return <img src={`https://flagcdn.com/${isoCode}.svg`} alt={lang} {...props} />;
};
