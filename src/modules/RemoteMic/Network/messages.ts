import { ValuesType } from 'utility-types';
import { SongPreview } from '~/interfaces';
import { backgroundTheme } from '~/modules/Elements/LayoutWithBackground';
import { Params } from '~/modules/hooks/useKeyboard';
import { HelpEntry } from '~/routes/KeyboardHelp/Context';
import { RemoteMicPermissions } from '~/routes/Settings/SettingsState';

export interface NetworkRegisterMessage {
  t: 'register';
  id: string;
  name: string;
  silent: boolean;
  lag: number;
}

export interface NetworkUnregisterMessage {
  t: 'unregister';
}

export interface NetworkRegisterRoomMessage {
  t: 'register-room';
  id: string;
}

export interface NetworkStartMonitorMessage {
  t: 'start-monitor';
}

export interface NetworkStopMonitorMessage {
  t: 'stop-monitor';
}

export interface NetworkPlayerNumberMessage {
  t: 'set-player-number';
  playerNumber: 0 | 1 | 2 | 3 | null;
}

export interface NetworkNewFrequencyMessage {
  t: 'freq';
  0: number[]; // frequencies
  1: number; // volume
}

export type keyStrokes = keyof Params;

export interface NetworkReloadMicMessage {
  t: 'reload-mic';
}

export interface NetworkKeyStrokeMessage {
  t: 'keystroke';
  key: keyStrokes;
}
export interface NetworkRequestReadinessMessage {
  t: 'request-readiness';
}

export interface NetworkConfirmReadinessMessage {
  t: 'confirm-readiness';
}

export interface NetworkPingMessageEvent {
  t: 'ping';
}
export interface NetworkPongMessageEvent {
  t: 'pong';
}

export interface NetworkRequestSongListMessage {
  t: 'request-songlist';
}
export interface NetworkSongListMessage {
  t: 'songlist';
  custom: Array<Pick<SongPreview, 'artist' | 'title' | 'video' | 'language' | 'search'>>;
  deleted: string[];
}

export interface NetworkRemoteMicMyListMessage {
  t: 'my-list';
  added?: string[];
  deleted?: string[];
}

export interface NetworkRequestMicSelectMessage {
  t: 'request-mic-select';
  id: string;
  playerNumber: 0 | 1 | 2 | 3 | null;
}

export interface NetworkRemoteKeyboardMessage {
  t: 'keyboard-layout';
  help: HelpEntry | undefined;
}

export interface NetworkSetPermissionsMessage {
  t: 'set-permissions';
  level: ValuesType<typeof RemoteMicPermissions>;
}

export interface NetworkSearchSongMessage {
  t: 'search-song';
  search: string;
}

export interface NetworkSelectSongMessage {
  t: 'select-song';
  id: string;
}

export interface NetworkRemovePlayerMessage {
  t: 'remove-player';
  id: string;
}

export interface NetworkSetGameInputLagRequestMessage {
  t: 'set-game-input-lag-request';
  value: number;
}

export interface NetworkGetGameInputLagRequestMessage {
  t: 'get-game-input-lag-request';
}

export interface NetworkGetGameInputLagResponseMessage {
  t: 'get-game-input-lag-response';
  value: number;
}

export interface NetworkGetMicrophoneLagRequestMessage {
  t: 'get-microphone-lag-request';
}

export interface NetworkGetMicrophoneLagResponseMessage {
  t: 'get-microphone-lag-response';
  value: number;
}

export interface NetworkSetMicrophoneLagRequestMessage {
  t: 'set-microphone-lag-request';
  value: number;
}

export interface NetworkSubscribeMessage {
  t: 'subscribe-event';
  channel: 'remote-mics';
}
export interface NetworkUnsubscribeMessage {
  t: 'unsubscribe-event';
  channel: NetworkSubscribeMessage['channel'];
}
export interface NetworkRemoteMicListMessage {
  t: 'remote-mics-list';
  list: Array<{ id: string; name: string; number: 0 | 1 | 2 | 3 | null }>;
}
export interface NetworkStyleChangeMessage {
  t: 'style-change';
  style: backgroundTheme;
}

export interface NetworkSongSelectionPlayerSettingsMessage {
  t: 'song-selection-player-settings';
}

export interface NetworkGetUnassignPlayersAfterSongFinishedRequestMessage {
  t: 'get-unassign-players-after-song-finished-setting-request';
}

export interface NetworkGetUnassignPlayersAfterSongFinishedResponseMessage {
  t: 'get-unassign-players-after-song-finished-setting-response';
  state: boolean;
}

export interface NetworkSetUnassignPlayersAfterSongFinishedRequestMessage {
  t: 'set-unassign-players-after-song-finished-setting-request';
  state: boolean;
}

export type NetworkMessages =
  | NetworkGetUnassignPlayersAfterSongFinishedRequestMessage
  | NetworkGetUnassignPlayersAfterSongFinishedResponseMessage
  | NetworkSetUnassignPlayersAfterSongFinishedRequestMessage
  | NetworkSongSelectionPlayerSettingsMessage
  | NetworkRemoteMicMyListMessage
  | NetworkSelectSongMessage
  | NetworkSubscribeMessage
  | NetworkUnsubscribeMessage
  | NetworkRemoteMicListMessage
  | NetworkSetPermissionsMessage
  | NetworkPlayerNumberMessage
  | NetworkRegisterMessage
  | NetworkUnregisterMessage
  | NetworkRegisterRoomMessage
  | NetworkStartMonitorMessage
  | NetworkStopMonitorMessage
  | NetworkKeyStrokeMessage
  | NetworkRemoteKeyboardMessage
  | NetworkReloadMicMessage
  | NetworkRequestReadinessMessage
  | NetworkConfirmReadinessMessage
  | NetworkRequestMicSelectMessage
  | NetworkPingMessageEvent
  | NetworkPongMessageEvent
  | NetworkRequestSongListMessage
  | NetworkSongListMessage
  | NetworkSearchSongMessage
  | NetworkSetGameInputLagRequestMessage
  | NetworkGetGameInputLagRequestMessage
  | NetworkGetGameInputLagResponseMessage
  | NetworkGetMicrophoneLagRequestMessage
  | NetworkGetMicrophoneLagResponseMessage
  | NetworkSetMicrophoneLagRequestMessage
  | NetworkStyleChangeMessage
  | NetworkRemovePlayerMessage
  | NetworkNewFrequencyMessage;
