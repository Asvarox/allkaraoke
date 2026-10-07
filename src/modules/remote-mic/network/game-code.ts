/** A game code as the phone types it: the transport's lead letter (`GAME_CODE_TRANSPORT_PREFIX`,
 * kept in sync by a test) and four lowercase letters. */
const REMOTE_MIC_GAME_CODE_PATTERN = /^[krw][a-z]{4}$/;

/** Whether a typed code is a remote-mic game code, e.g. one entered into online mode by mistake. */
export const isRemoteMicGameCode = (code: string): boolean =>
  REMOTE_MIC_GAME_CODE_PATTERN.test(code.trim().toLowerCase());
