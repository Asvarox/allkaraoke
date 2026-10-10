// https://eu.posthog.com/project/281/feature_flags?tab=overview
export const FeatureFlags = {
  RemoteMicConnectionType: 'remote_mics_connection_type',
  // Percentage rollout of the Cloudflare Realtime transport for remote mics; decides new game codes only
  RemoteMicsRealtime: 'remote_mics_realtime',
  InitialInputLag: 'initial_input_lag',
  MobileModeAutoOptIn: 'mobile_mode_auto_opt_in',
} as const;
