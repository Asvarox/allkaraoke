import { diffImages, RGBAImage } from '~/modules/utils/image-diff';

// Runs the (potentially heavy) pixel diffing off the main thread so the screenshots page stays
// responsive while every captured baseline is compared against its current counterpart.

export interface DiffWorkerRequest {
  key: string;
  /** Content signature of the pair being diffed; echoed back so results can't be mis-paired. */
  signature: string;
  baseline: Blob;
  current: Blob;
}

export type DiffWorkerResponse =
  | {
      key: string;
      signature: string;
      ok: true;
      mismatchedPixels: number;
      ratio: number;
      width: number;
      height: number;
      diff: Blob;
    }
  | { key: string; signature: string; ok: false; error: string };

const post = (message: DiffWorkerResponse) => (self as unknown as Worker).postMessage(message);

async function toRGBA(blob: Blob): Promise<RGBAImage> {
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('OffscreenCanvas 2d context unavailable');
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } finally {
    bitmap.close();
  }
}

self.onmessage = async (event: MessageEvent<DiffWorkerRequest>) => {
  const { key, signature, baseline, current } = event.data;
  try {
    const [a, b] = await Promise.all([toRGBA(baseline), toRGBA(current)]);
    const result = diffImages(a, b);

    const canvas = new OffscreenCanvas(result.width, result.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('OffscreenCanvas 2d context unavailable');
    ctx.putImageData(new ImageData(new Uint8ClampedArray(result.data), result.width, result.height), 0, 0);
    const diff = await canvas.convertToBlob({ type: 'image/png' });

    post({
      key,
      signature,
      ok: true,
      mismatchedPixels: result.mismatchedPixels,
      ratio: result.ratio,
      width: result.width,
      height: result.height,
      diff,
    });
  } catch (error) {
    post({ key, signature, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
