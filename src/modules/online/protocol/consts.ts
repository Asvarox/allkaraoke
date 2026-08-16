/** Maximum size of a serialized chart (song txt) that can be transferred to the room.
 * The biggest chart in the game is ~30 KB raw (a few KB gzipped), so this is generous. */
export const ONLINE_MAX_CHART_BYTES = 512 * 1024;

/** How long a disconnected participant keeps their spot (and the host their role) before removal. */
export const ONLINE_RECONNECT_GRACE_MS = 15_000;

/** Idle room time-to-live — storage is wiped this long after the last activity. */
export const ONLINE_ROOM_TTL_MS = 6 * 60 * 60 * 1_000;

/** How long a singer can report buffering before the room auto-pauses for everyone. */
export const ONLINE_BUFFERING_PAUSE_MS = 1_000;

/** How long the room waits for everyone to confirm readiness before starting the song anyway —
 * the same autostart the local game gives its remote mics. */
export const ONLINE_READINESS_TIMEOUT_MS = 15_000;

/** Lead time between the room deciding to start and the video actually rolling. Long enough for the
 * readiness screen to show its last tick and bow out, rather than being cut off the instant the
 * final singer confirms — and it doubles as the window every client schedules its play() in. */
export const ONLINE_START_LEAD_MS = 2_000;

/** Short countdown before resuming after a pause. */
export const ONLINE_RESUME_COUNTDOWN_MS = 3_000;

/** Clients seek when their playback drifts further than this from the room's expected position. */
export const ONLINE_DRIFT_THRESHOLD_MS = 500;

/** Leaderboard broadcasts are coalesced so subscribers get at most one update per this interval. */
export const ONLINE_LEADERBOARD_PUBLISH_MS = 500;

/** Player-stats (ping/volume) broadcasts are coalesced to at most one per this interval. */
export const ONLINE_STATS_PUBLISH_MS = 1_000;

/** How long the room waits for final scores after the host ends the game before forcing results. */
export const ONLINE_FORCE_RESULTS_MS = 5_000;

export const ONLINE_ROOM_CODE_LENGTH = 5;

/** Longest name a participant can set for themselves (matches the local game's MAX_NAME_LENGTH). */
export const ONLINE_MAX_NAME_LENGTH = 20;

/** Supported range for the pitch-matching tolerance — same scale as the local game's difficulty
 * picker (1 = Hard .. 3 = Easy in production, up to 6 for the dev-only debug difficulties). */
export const ONLINE_MIN_TOLERANCE = 1;
export const ONLINE_MAX_TOLERANCE = 6;
