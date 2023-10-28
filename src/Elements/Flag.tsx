import { Song } from 'interfaces';
import languageNameToIsoCode from 'utils/languageNameToIsoCode';

type Props =
  | {
      language: Song['language'];
    }
  | {
      isocode: string;
    };
export const Flag = (props: Props) => {
  const isoCode =
    'isocode' in props
      ? props.isocode?.toLowerCase()
      : languageNameToIsoCode(Array.isArray(props.language) ? props.language[0] : props.language);

  if (!isoCode) return null;

  return <img src={`https://flagcdn.com/${isoCode}.svg`} alt={isoCode} {...props} />;
};
