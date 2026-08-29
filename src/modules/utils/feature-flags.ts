// https://eu.posthog.com/project/281/feature_flags?tab=overview
export const FeatureFlags = {
  Eurovision: 'eurovision',
  RemoteMicConnectionType: 'remote_mics_connection_type',
  InitialInputLag: 'initial_input_lag',
  NewVolume: 'new_volume',
  DisableMobileMode: 'disable_mobile_mode',
  DisableAutoFullscreen: 'disable_auto_fullscreen',
  InstantSongPreview: 'instant_song_preview',
  OnlineMode: 'online_mode',
  /** Runs online rooms peer-to-peer over the Cloudflare Realtime SFU, with the room's authority in
   * the host's browser. Off means the server-authoritative Durable Object room — the mode online
   * mode shipped with, kept as the fallback. See docs/online-mode.md. */
  OnlineP2P: 'online_p2p',
  Leaderboard: 'leaderboard',
} as const;
