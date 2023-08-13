import { HelpEntry } from 'Scenes/KeyboardHelp/Context';
import { RemoteMicPermissions } from 'Scenes/Settings/SettingsState';
import { Params } from 'hooks/useKeyboard';
import { SongPreview } from 'interfaces';
import { ValuesType } from 'utility-types';

export interface NetworkRegisterMessage {
    t: 'register';
    id: string;
    name: string;
    silent: boolean;
}

export interface NetworkUnregisterMessage {
    t: 'unregister';
}

export interface NetworkStartMonitorMessage {
    t: 'start-monitor';
}

export interface NetworkUnregisterMessage {
    t: 'unregister';
}

export interface NetworkStopMonitorMessage {
    t: 'stop-monitor';
}

export interface NetworkPlayerNumberMessage {
    t: 'set-player-number';
    playerNumber: number | null;
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
    custom: Array<Pick<SongPreview, 'artist' | 'title' | 'video' | 'language'>>;
    deleted: string[];
}

export interface NetworkRequestMicSelectMessage {
    t: 'request-mic-select';
    id: string;
    playerNumber: number | null;
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

export interface NetworkSetInputLagRequestMessage {
    t: 'set-input-lag-request';
    value: number;
}

export interface NetworkGetInputLagRequestMessage {
    t: 'get-input-lag-request';
}

export interface NetworkGetInputLagResponseMessage {
    t: 'get-input-lag-response';
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
    list: Array<{ id: string; name: string; number: number | null }>;
}

export type NetworkMessages =
    | NetworkSubscribeMessage
    | NetworkUnsubscribeMessage
    | NetworkRemoteMicListMessage
    | NetworkSetPermissionsMessage
    | NetworkPlayerNumberMessage
    | NetworkRegisterMessage
    | NetworkStartMonitorMessage
    | NetworkStopMonitorMessage
    | NetworkKeyStrokeMessage
    | NetworkRemoteKeyboardMessage
    | NetworkUnregisterMessage
    | NetworkReloadMicMessage
    | NetworkRequestReadinessMessage
    | NetworkConfirmReadinessMessage
    | NetworkRequestMicSelectMessage
    | NetworkPingMessageEvent
    | NetworkPongMessageEvent
    | NetworkRequestSongListMessage
    | NetworkSongListMessage
    | NetworkSearchSongMessage
    | NetworkSetInputLagRequestMessage
    | NetworkGetInputLagRequestMessage
    | NetworkGetInputLagResponseMessage
    | NetworkNewFrequencyMessage;
