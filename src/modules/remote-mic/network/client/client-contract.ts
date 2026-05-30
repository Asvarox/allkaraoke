import { RemoteMicPermission } from '~/routes/settings/settings-state';

// Defines all methods the server can call on the client via rpc-call messages.
// Implementations are registered imperatively (in NetworkClient) or via the useClientHandler hook.
export interface ClientContract {
  startMonitor: () => void;
  stopMonitor: () => void;
  setPlayerNumber: (playerNumber: 0 | 1 | 2 | 3 | null) => void;
  setPermissions: (level: RemoteMicPermission) => void;
  reload: () => void;
  requestReadiness: () => void;
  // Sent by the host when the player settings screen is shown, so unassigned phones can auto-open the player picker
  notifyPlayerSettingsOpen: () => void;
}
