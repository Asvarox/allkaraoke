// Relative imports on purpose: the `~` alias is only configured for the app build, not the Worker one
import { REMOTE_MIC_REALTIME } from '../src/modules/remote-mic/network/realtime-protocol';
import { createRealtimeSignaling, RealtimeEnv } from './realtime/signaling';
import type { RemoteMicDirectory } from './remote-mic-directory-do';

export interface RemoteMicSignalingEnv extends RealtimeEnv {
  REMOTE_MIC_DIRECTORY?: DurableObjectNamespace<RemoteMicDirectory>;
}

/** Remote mics' signaling for Realtime game codes, on the same Realtime app as online mode. */
export const handleRemoteMicSignaling = createRealtimeSignaling<RemoteMicSignalingEnv>(
  REMOTE_MIC_REALTIME,
  (env) => env.REMOTE_MIC_DIRECTORY,
);
