import { SongPreview } from 'interfaces';
import { Flag } from 'modules/Elements/Flag';
import langMap from 'modules/Elements/Flag/mapping';
import { ComponentProps, useMemo } from 'react';

// skipping US and GB songs as there are a lot of them making the list look messy
const SKIPPED_ORIGINS = ['US', 'GB'];

interface Props {
  song: Pick<SongPreview, 'language' | 'artistOrigin'>;
  forceFlag?: boolean;
}
export default function SongFlag({ song, forceFlag, ...props }: Props & Omit<ComponentProps<typeof Flag>, 'isocode'>) {
  const lang = song.language[0];

  const isLangArtistOrigin = useMemo(() => {
    if (!song.artistOrigin) return false;
    return langMap[song.artistOrigin.toLowerCase()]?.includes(lang) ?? forceFlag;
  }, [song.artistOrigin, lang, forceFlag]);

  return (
    <>
      {forceFlag && song.artistOrigin ? (
        <Flag isocode={song.artistOrigin!} {...props} />
      ) : isLangArtistOrigin && !SKIPPED_ORIGINS.includes(song.artistOrigin!) ? (
        <Flag isocode={song.artistOrigin!} {...props} />
      ) : song.language[0] !== 'English' ? (
        <Flag language={song.language} {...props} />
      ) : null}
    </>
  );
}
