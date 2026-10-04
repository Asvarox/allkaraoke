// Relative imports on purpose: the `~` alias is only configured for the app build, not the Worker one
import { ONLINE_REALTIME } from '../src/modules/online/signaling/protocol';
import type { OnlineDirectory } from './online-directory-do';
import { createRealtimeSignaling, RealtimeEnv } from './realtime/signaling';

export interface OnlineSignalingEnv extends RealtimeEnv {
  ONLINE_DIRECTORY?: DurableObjectNamespace<OnlineDirectory>;
}

/** Online mode's signaling under `/online/`. */
export const handleOnlineSignaling = createRealtimeSignaling<OnlineSignalingEnv>(
  ONLINE_REALTIME,
  (env) => env.ONLINE_DIRECTORY,
);
