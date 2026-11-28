/** Which of the song's videos something is about. The instrumental is a separate video, flagged and synced on its own */
export type SongVersion = 'original' | 'instrumental';

/** Reads a version from a query param, PostHog property or key suffix - anything unknown is the original */
export const toSongVersion = (value: unknown): SongVersion => (value === 'instrumental' ? 'instrumental' : 'original');

/** Flag, review and baseline key: the song id, suffixed for the instrumental */
export const getSongVersionKey = (songId: string, version: SongVersion = 'original') =>
  version === 'instrumental' ? `${songId}:instrumental` : songId;

export const parseSongVersionKey = (key: string) => {
  const [songId, suffix] = key.split(':');
  return { songId, version: toSongVersion(suffix) };
};
