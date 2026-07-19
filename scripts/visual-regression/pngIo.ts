import { readFileSync, writeFileSync } from 'node:fs';

import { PNG } from 'pngjs';

import type { RGBAImage } from '../../src/modules/utils/image-diff';

/** Decodes a PNG file into raw RGBA data (Node-only, uses pngjs/zlib). */
export function readPng(path: string): RGBAImage {
  const png = PNG.sync.read(readFileSync(path));
  return { width: png.width, height: png.height, data: png.data };
}

/** Decodes a PNG from an in-memory buffer (e.g. `git show` output). */
export function decodePng(buffer: Buffer): RGBAImage {
  const png = PNG.sync.read(buffer);
  return { width: png.width, height: png.height, data: png.data };
}

/** Encodes raw RGBA data and writes it to a PNG file. */
export function writePng(path: string, image: RGBAImage): void {
  const png = new PNG({ width: image.width, height: image.height });
  png.data = Buffer.from(image.data.buffer, image.data.byteOffset, image.data.byteLength);
  writeFileSync(path, PNG.sync.write(png));
}
