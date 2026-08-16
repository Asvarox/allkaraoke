import { SongPreview } from '~/interfaces';
import { SongHoverPreview } from '~/modules/online/protocol/types';

/** The fields the wire payload is built from. Both `Song` and `SongPreview` structurally satisfy
 * it, so the host publishes the same shape whether they're hovering a row in the browser or have
 * confirmed a fully loaded chart. */
type SongHoverPreviewSource = Pick<
  SongPreview,
  | 'id'
  | 'artist'
  | 'title'
  | 'video'
  | 'language'
  | 'artistOrigin'
  | 'year'
  | 'previewStart'
  | 'previewEnd'
  | 'volume'
  | 'videoGap'
  | 'manualVolume'
>;

/** Describes "the song on screen" for the rest of the room — enough for every client to render the
 * header and play the same preview snippet the host is hearing. */
export const toSongHoverPreview = (song: SongHoverPreviewSource, difficulty?: string): SongHoverPreview => ({
  songId: song.id,
  artist: song.artist,
  title: song.title,
  difficulty,
  // Online v1 is Duel-only
  mode: 'Duel',
  video: song.video,
  language: song.language,
  artistOrigin: song.artistOrigin,
  year: song.year,
  // Same fallbacks the local song browser's preview player uses (song-selection/components/song-preview.tsx):
  // a minute past the video gap when the song declares no preview point, and the auto-detected
  // volume with the older hand-set one as backup — so the room hears what the host hears.
  previewStart: song.previewStart ?? (song.videoGap ?? 0) + 60,
  previewEnd: song.previewEnd,
  volume: song.volume ?? song.manualVolume,
});
