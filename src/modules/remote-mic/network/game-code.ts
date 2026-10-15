import { REMOTE_MIC_ROOM_CODE_PATTERN } from '~/modules/remote-mic/network/realtime-protocol';

/** Whether a typed code is a remote-mic game code, e.g. one entered into online mode by mistake. */
export const isRemoteMicGameCode = (code: string): boolean =>
  REMOTE_MIC_ROOM_CODE_PATTERN.test(code.trim().toLowerCase());
