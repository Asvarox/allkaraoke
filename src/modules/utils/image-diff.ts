import pixelmatch from 'pixelmatch';

/**
 * Raw RGBA image data. Deliberately framework/runtime agnostic so this module
 * can run both in Node (via {@link ./pngIo}) and in the browser (e.g. from a
 * `CanvasRenderingContext2D.getImageData()` result), where `data` is a
 * `Uint8ClampedArray`.
 */
export interface RGBAImage {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
}

export interface DiffResult extends RGBAImage {
  data: Uint8Array;
  /** Number of pixels that differ between the two images. */
  mismatchedPixels: number;
  /** Total number of pixels compared (width * height of the compared canvas). */
  totalPixels: number;
  /** Fraction of mismatched pixels, in the range [0, 1]. */
  ratio: number;
}

/**
 * Copies `image` onto a fresh transparent RGBA canvas of the given size,
 * anchored top-left. Used to bring two differently-sized snapshots to a common
 * size so they can be compared pixel by pixel.
 */
function padTo(image: RGBAImage, width: number, height: number): RGBAImage {
  if (image.width === width && image.height === height) {
    return { ...image, data: image.data };
  }

  const data = new Uint8Array(width * height * 4);
  const rowBytes = image.width * 4;
  for (let y = 0; y < image.height; y++) {
    const from = y * rowBytes;
    data.set(image.data.subarray(from, from + rowBytes), y * width * 4);
  }

  return { width, height, data };
}

/**
 * Produces a diff image (matching what Playwright shows: changed pixels tinted
 * red) between two RGBA images. Images of differing dimensions are padded to a
 * common size first, so a resize shows up as a difference rather than throwing.
 *
 * This is a pure function with no I/O, so it works unchanged in the browser.
 */
export function diffImages(a: RGBAImage, b: RGBAImage, threshold = 0.1): DiffResult {
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);

  const paddedA = padTo(a, width, height);
  const paddedB = padTo(b, width, height);

  const data = new Uint8Array(width * height * 4);
  const mismatchedPixels = pixelmatch(paddedA.data, paddedB.data, data, width, height, {
    threshold,
    includeAA: false,
  });

  const totalPixels = width * height;
  return {
    width,
    height,
    data,
    mismatchedPixels,
    totalPixels,
    ratio: totalPixels === 0 ? 0 : mismatchedPixels / totalPixels,
  };
}
