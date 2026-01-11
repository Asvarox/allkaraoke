import { ComponentProps, useLayoutEffect, useState } from 'react';
import { Song } from '~/interfaces';
import languageNameToIsoCode from '~/modules/utils/languageNameToIsoCode';

const overrides = import.meta.glob<string>('./Flag/flags/*.svg', { query: '?url', eager: true, import: 'default' });

type Props =
  | {
      language: Song['language'];
    }
  | {
      isocode: string;
    };

export const Flag = (props: Props & Omit<ComponentProps<'img'>, 'src' | 'alt'>) => {
  const [isoCodeOverride, setIsoCodeOverride] = useState<string | null>(null);
  const isoCode =
    'isocode' in props
      ? props.isocode?.toLowerCase()
      : languageNameToIsoCode(Array.isArray(props.language) ? props.language[0] : props.language);

  useLayoutEffect(() => {
    if (isoCode) {
      setIsoCodeOverride(null);
    }
  }, [isoCode]);

  if (!isoCode) return null;

  const customFlag = overrides[`./Flag/flags/${isoCode}.svg`];

  return (
    <img
      data-isocode={isoCode}
      src={customFlag ?? `https://flagcdn.com/${isoCodeOverride ?? isoCode}.svg`}
      alt={isoCode}
      {...props}
      onError={() => setIsoCodeOverride('un')}
    />
  );
};
