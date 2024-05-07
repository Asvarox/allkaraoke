import styled from '@emotion/styled';
import { Song } from 'interfaces';
import { ComponentProps, useLayoutEffect, useState } from 'react';
import languageNameToIsoCode from 'utils/languageNameToIsoCode';

const overrides = import.meta.glob('./Flag/flags/*.svg', { as: 'url', eager: true });

type Props =
  | {
      language: Song['language'];
    }
  | {
      isocode: string;
    };

export const Flag = (props: Props & Omit<ComponentProps<typeof Img>, 'src' | 'alt'>) => {
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
    <Img
      data-isocode={isoCode}
      src={customFlag ?? `https://flagcdn.com/${isoCodeOverride ?? isoCode}.svg`}
      alt={isoCode}
      {...props}
      onError={() => setIsoCodeOverride('un')}
    />
  );
};

const Img = styled.img``;
