import { ChartManifest } from '~/modules/online/protocol/types';

/**
 * The compressed chart payload this browser last downloaded, kept so that taking over as host does
 * not mean losing the song everyone is in the middle of singing.
 *
 * The snapshot the host broadcasts for its succession line deliberately leaves the chart out — it
 * is the one large field, it changes once per song, and every singer already had to fetch it to
 * sing at all. A successor therefore restores it from here rather than being sent it repeatedly.
 */
let cached: { hash: string; data: string } | null = null;

export const cacheChartData = (manifest: ChartManifest, data: string) => {
  cached = { hash: manifest.hash, data };
};

/** The cached payload for this manifest, or null when this browser never downloaded that chart
 * (it joined after the song was picked and has not fetched it yet). */
export const getCachedChartData = (manifest: ChartManifest | null): string | null => {
  if (!manifest || cached?.hash !== manifest.hash) return null;
  return cached.data;
};

export const clearChartCache = () => {
  cached = null;
};
