import * as msgpackr from 'msgpackr';

export function getPingTime() {
  return Date.now();
}

export const pack = <T>(data: T): Buffer => {
  return msgpackr.pack(data);
};

export const unpack = <T>(buffer: Uint8Array): T => {
  return msgpackr.unpack(buffer);
};
