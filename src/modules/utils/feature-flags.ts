// https://eu.posthog.com/project/281/feature_flags?tab=overview
export const FeatureFlags = {
  Eurovision: 'eurovision',
  RemoteMicConnectionType: 'remote_mics_connection_type',
  InitialInputLag: 'initial_input_lag',
  MobileModeAutoOptIn: 'mobile_mode_auto_opt_in',
  /** Runs online rooms peer-to-peer over the Cloudflare Realtime SFU, with the room's authority in
   * the host's browser. Off means the server-authoritative Durable Object room — the mode online
   * mode shipped with, kept as the fallback. See docs/online-mode.md. */
  OnlineP2P: 'online_p2p',
} as const;
