import { Flag } from 'Elements/Flag';
import langMap from 'Elements/Flag/mapping';
import { SongPreview } from 'interfaces';
import { useMemo } from 'react';

// skipping US and GB songs as there are a lot of them making the list look messy
const SKIPPED_ORIGINS = ['US', 'GB'];

interface Props {
  song: Pick<SongPreview, 'language' | 'artistOrigin'>;
}
export default function SongFlag({ song, ...props }: Props) {
  const lang = song.language[0];

  const isLangArtistOrigin = useMemo(() => {
    if (!song.artistOrigin) return false;
    return langMap[song.artistOrigin.toLowerCase()]?.includes(lang) ?? false;
  }, [song.artistOrigin, lang]);

  return (
    <>
      {isLangArtistOrigin && !SKIPPED_ORIGINS.includes(song.artistOrigin!) ? (
        <Flag isocode={song.artistOrigin!} {...props} />
      ) : song.language[0] !== 'English' ? (
        <Flag language={song.language} {...props} />
      ) : null}
    </>
  );
}
