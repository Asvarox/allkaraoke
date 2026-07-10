/** Central player-number type and limits. The game engine (drawing, scoring, events) supports
 * up to MAX_SUPPORTED_PLAYERS; local party mode stays capped at MAX_PLAYERS while online mode
 * uses ONLINE_MAX_PLAYERS. */
export type PlayerNumber = 0 | 1 | 2 | 3 | 4 | 5;

/** Highest number of players the shared game primitives (colors, results, events) can render. */
export const MAX_SUPPORTED_PLAYERS = 6;

/** Local party mode player cap — unchanged from before online mode was added. */
export const MAX_PLAYERS = 4;

/** Online mode player cap. */
export const ONLINE_MAX_PLAYERS = 6;

export const PLAYER_NUMBERS: PlayerNumber[] = [0, 1, 2, 3, 4, 5];
