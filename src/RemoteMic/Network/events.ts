import { HelpEntry } from 'Scenes/KeyboardHelp/Context';
import { RemoteMicPermissions } from 'Scenes/Settings/SettingsState';
import { Params } from 'hooks/useKeyboard';
import { SongPreview } from 'interfaces';
import { ValuesType } from 'utility-types';

export interface WebRTCRegisterEvent {
    t: 'register';
    id: string;
    name: string;
    silent: boolean;
}

export interface WebRTCUnregisterEvent {
    t: 'unregister';
}

export interface WebRTCStartMonitorEvent {
    t: 'start-monitor';
}

export interface WebRTCUnregisterEvent {
    t: 'unregister';
}

export interface WebRTCStopMonitorEvent {
    t: 'stop-monitor';
}

export interface WebRTCSetPlayerNumber {
    t: 'set-player-number';
    playerNumber: number | null;
}

export interface WebRTCNewFrequencyEvent {
    t: 'freq';
    0: number[]; // frequencies
    1: number; // volume
}

export type keyStrokes = keyof Params; // 'up' | 'down' | 'left' | 'right' | 'Enter' | 'Escape,Backspace' | 'Shift+R';

export interface WebRTCReloadMicEvent {
    t: 'reload-mic';
}

export interface WebRTCKeyStrokeEvent {
    t: 'keystroke';
    key: keyStrokes;
}
export interface WebRTCRequestReadinessEvent {
    t: 'request-readiness';
}

export interface WebRTCConfirmReadinessEvent {
    t: 'confirm-readiness';
}

export interface WebRTCPingEventEvent {
    t: 'ping';
}
export interface WebRTCPongEventEvent {
    t: 'pong';
}

export interface WebRTCRequestSongListEvent {
    t: 'request-songlist';
}
export interface WebRTCSongListEvent {
    t: 'songlist';
    custom: Array<Pick<SongPreview, 'artist' | 'title' | 'video' | 'language'>>;
    deleted: string[];
}

export interface WebRTCRequestMicSelectEvent {
    t: 'request-mic-select';
    id: string;
    playerNumber: number | null;
}

export interface WebRTCRemoteKeyboardEvent {
    t: 'keyboard-layout';
    help: HelpEntry | undefined;
}

export interface WebRTCSetPermissionsEvent {
    t: 'set-permissions';
    level: ValuesType<typeof RemoteMicPermissions>;
}

export interface WebRTCSearchSongEvent {
    t: 'search-song';
    search: string;
}

export interface WebRTCSubscribeEvent {
    t: 'subscribe-event';
    channel: 'remote-mics';
}
export interface WebRTCUnsubscribeEvent {
    t: 'unsubscribe-event';
    channel: WebRTCSubscribeEvent['channel'];
}
export interface WebRTCRemoteMicListEvent {
    t: 'remote-mics-list';
    list: Array<{ id: string; name: string; number: number | null }>;
}

export type WebRTCEvents =
    | WebRTCSubscribeEvent
    | WebRTCUnsubscribeEvent
    | WebRTCRemoteMicListEvent
    | WebRTCSetPermissionsEvent
    | WebRTCSetPlayerNumber
    | WebRTCRegisterEvent
    | WebRTCStartMonitorEvent
    | WebRTCStopMonitorEvent
    | WebRTCKeyStrokeEvent
    | WebRTCRemoteKeyboardEvent
    | WebRTCUnregisterEvent
    | WebRTCReloadMicEvent
    | WebRTCRequestReadinessEvent
    | WebRTCConfirmReadinessEvent
    | WebRTCRequestMicSelectEvent
    | WebRTCPingEventEvent
    | WebRTCPongEventEvent
    | WebRTCRequestSongListEvent
    | WebRTCSongListEvent
    | WebRTCSearchSongEvent
    | WebRTCNewFrequencyEvent;
