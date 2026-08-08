import { Song, SongPreview } from '~/interfaces';
import OnlineClient from '~/modules/online/client/online-client';
import { toSongHoverPreview } from '~/modules/online/client/song-preview';
import { prepareChartTransfer, unpackChartTransfer } from '~/modules/online/protocol/chart-transfer';
import { ChartManifest } from '~/modules/online/protocol/types';
import { loadSongById } from '~/modules/songs/load-song';
import convertSongToTxt from '~/modules/songs/utils/convert-song-to-txt';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import { processSong } from '~/modules/songs/utils/process-song/process-song';

/** Loads the full song for any source (built-in, local, shared/unverified) — the single
 * code path used before serializing the chart for transfer. Same loader the local game uses, so
 * a shared song carries the same provenance here as it does when sung locally. */
export const loadSongForUpload = async (
  preview: Pick<SongPreview, 'id'> & Partial<Pick<SongPreview, 'sourceType' | 'sharedSongId'>>,
): Promise<Song> => {
  const song = await loadSongById(preview.id, {
    sourceType: preview.sourceType,
    sharedSongId: preview.sharedSongId,
  });
  if (!song) {
    throw new Error(`Song not found: ${preview.id}`);
  }
  return song;
};

/** Host: serialize the selected song (built-in, shared or local — always the same path),
 * gzip it and send it to the room in a single message. Throws ChartTooLargeError when oversized.
 * The preview (video/details) stays published so the room can still see and hear the song. */
export const uploadSongToRoom = async (song: Song, tolerance: number, difficulty?: string): Promise<void> => {
  const txt = convertSongToTxt(song);
  const { manifest, data } = await prepareChartTransfer(
    { songId: song.id, artist: song.artist, title: song.title, video: song.video },
    txt,
  );
  await OnlineClient.rpc.selection.setChart(manifest, data, tolerance, toSongHoverPreview(song, difficulty));
};

/** Any client (including late joiners): download the compressed chart from room storage and
 * reconstruct the Song. Validates integrity against the manifest. */
export const downloadSongFromRoom = async (manifest: ChartManifest): Promise<Song> => {
  const data = await OnlineClient.rpc.selection.getChart();
  const txt = await unpackChartTransfer(manifest, data);
  return processSong(convertTxtToSong(txt));
};
