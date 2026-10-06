import { PlayerNumber } from '~/modules/players/player-number';
import { RemoteMicPermission } from '~/routes/settings/settings-state';

// Defines all methods the server can call on the client via rpc-call messages.
// Implementations are registered imperatively (in NetworkClient) or via the useClientHandler hook.
export interface ClientContract {
  startMonitor: () => void;
  stopMonitor: () => void;
  setPlayerNumber: (playerNumber: PlayerNumber | null) => void;
  setPermissions: (level: RemoteMicPermission) => void;
  reload: () => void;
  requestReadiness: () => void;
  // Bracket one song on the host, so a singing phone reports that song's ping as a single event
  songStarted: () => void;
  songEnded: () => void;
  // Sent by the host when the player settings screen is shown, so unassigned phones can auto-open the player picker
  notifyPlayerSettingsOpen: () => void;
}
