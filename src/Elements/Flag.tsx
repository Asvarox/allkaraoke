import { Song } from 'interfaces';
import languageNameToIsoCode from 'utils/languageNameToIsoCode';

const overrides = import.meta.glob('./Flag/flags/*.svg', { as: 'url', eager: true });

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

  const customFlag = overrides[`./Flag/flags/${isoCode}.svg`];

  return <img src={customFlag ?? `https://flagcdn.com/${isoCode}.svg`} alt={isoCode} {...props} />;
};
