import { ComponentProps } from 'react';
import { SongPreview } from '~/interfaces';
import { Chip } from '~/modules/Elements/AKUI/Chip';
import { Flag } from '~/modules/Elements/Flag';
import langMap from '~/modules/Elements/Flag/mapping';

// Pure ISO 639-1 language codes (no country-code overrides) for use as chip labels
const langNameToCode = (() => {
  const langNames = new Intl.DisplayNames(['en'], { type: 'language' });
  const map: Record<string, string> = {};
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 26; j++) {
      const code = String.fromCharCode(97 + i) + String.fromCharCode(97 + j);
      const name = langNames.of(code);
      if (name && name !== code) map[name] = code;
    }
  }
  return map;
})();

interface Props {
  song: Pick<SongPreview, 'language' | 'artistOrigin'>;
  forceFlag?: boolean;
  chip?: boolean;
}
export default function SongFlag({
  song,
  forceFlag,
  chip,
  ...props
}: Props & Omit<ComponentProps<typeof Flag>, 'isocode'>) {
  const lang = song.language[0];

  // Use artist origin as the flag when the language matches the origin country,
  // otherwise fall back to the language-based flag.
  const isLangArtistOrigin =
    !!song.artistOrigin && (langMap[song.artistOrigin.toLowerCase()]?.includes(lang) ?? forceFlag);

  const isocode =
    forceFlag && song.artistOrigin ? song.artistOrigin : isLangArtistOrigin ? song.artistOrigin! : undefined;

  const langCode = (langNameToCode[lang] ?? lang.slice(0, 2)).toUpperCase();

  if (chip) {
    return (
      <Chip variant="slate">
        {isocode ? (
          <Flag isocode={isocode} className="h-4 w-4 rounded-full object-cover" />
        ) : (
          <Flag language={song.language} className="h-4 w-4 rounded-full object-cover" />
        )}
        {langCode}
      </Chip>
    );
  }

  return <>{isocode ? <Flag isocode={isocode} {...props} /> : <Flag language={song.language} {...props} />}</>;
}
