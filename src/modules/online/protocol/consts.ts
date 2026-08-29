/** Maximum size of a serialized chart (song txt) that can be transferred to the room.
 * The biggest chart in the game is ~30 KB raw (a few KB gzipped), so this is generous. */
export const ONLINE_MAX_CHART_BYTES = 512 * 1024;

/** How often the host broadcasts a heartbeat. Every client watches this: it is the only signal
 * that distinguishes a room where nothing is happening from a host whose tab got throttled into
 * the background, and the room's authority now lives in a browser that can do exactly that. */
export const ONLINE_HOST_HEARTBEAT_MS = 1_000;

/** No heartbeat for this long and the host is presumed gone — the succession path starts. Several
 * beats' worth, because a foregrounded tab under load (pitch detection, video, rendering) can miss
 * one without being in any trouble. */
export const ONLINE_HOST_STALL_MS = 4_000;

/** How often the host rebroadcasts its snapshot for the succession line. Slow on purpose: it only
 * has to be fresh enough that a takeover is not visibly behind, and everything in it that changes
 * fast (the leaderboard, player stats) is republished on its own channel anyway. */
export const ONLINE_SNAPSHOT_BROADCAST_MS = 2_000;

/** Clients do not all rush the promotion endpoint at once: each waits its rank in the succession
 * order times this before claiming. The obvious successor lands first and everyone else's claim
 * comes back as a stale epoch, which is also how they learn who won. */
export const ONLINE_PROMOTE_STAGGER_MS = 750;

/** How long a disconnected participant keeps their spot (and the host their role) before removal. */
export const ONLINE_RECONNECT_GRACE_MS = 15_000;

/** Idle room time-to-live — storage is wiped this long after the last activity. Short because an
 * abandoned room now goes quiet (see ONLINE_IDLE_AFTER_MS) instead of holding the party awake, so
 * there is nothing to gain from keeping a dead room's snapshot around for hours. */
export const ONLINE_ROOM_TTL_MS = 30 * 60 * 1_000;

/** How long a singer can go without moving the pointer or pressing a key before their client stops
 * reporting stats and pinging altogether. Only applies in the lobby and on the results screen —
 * nobody touches the controls while a countdown is running or a song is playing. Long enough not to
 * blink out on someone reading the song list, short enough that a forgotten tab stops holding the
 * room (and its Durable Object duration bill) awake. */
export const ONLINE_IDLE_AFTER_MS = 30 * 1_000;

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

/** Player-stats (ping/volume) broadcasts are coalesced to at most one per this interval. Fast
 * enough for the volume bars to read as live meters (~3 updates/s) rather than a slideshow — the
 * payload is a couple of numbers per singer, and silent singers stop reporting altogether. */
export const ONLINE_STATS_PUBLISH_MS = 300;

/** How often each singer samples their mic volume and reports it (with their ping) to the room.
 * Matches the broadcast interval — sampling faster would only be coalesced away. */
export const ONLINE_STATS_REPORT_MS = 300;

/** How long the room waits for final scores after the host ends the game before forcing results. */
export const ONLINE_FORCE_RESULTS_MS = 5_000;

/** Online rooms are for singing together — a lone singer burns the room's duration bill on a
 * solo they could sing locally for free, so the host can't start until someone else is in. */
export const ONLINE_MIN_PLAYERS = 2;

export const ONLINE_ROOM_CODE_LENGTH = 5;

/** Longest name a participant can set for themselves (matches the local game's MAX_NAME_LENGTH). */
export const ONLINE_MAX_NAME_LENGTH = 20;

/** Supported range for the pitch-matching tolerance — same scale as the local game's difficulty
 * picker (1 = Hard .. 3 = Easy in production, up to 6 for the dev-only debug difficulties). */
export const ONLINE_MIN_TOLERANCE = 1;
export const ONLINE_MAX_TOLERANCE = 6;
