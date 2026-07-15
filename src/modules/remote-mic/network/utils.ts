import { pack as msgpackrPack, unpack as msgpackrUnpack } from 'msgpackr';

export function getPingTime() {
  return Date.now();
}

export const pack = <T>(data: T) => {
  return msgpackrPack(data) as BufferSource;
};

export const unpack = <T>(buffer: Uint8Array): T => {
  return msgpackrUnpack(buffer);
};
