import { HelpEntry } from 'Scenes/KeyboardHelp/Context';

export interface WebRTCRegisterEvent {
    type: 'register';
    id: string;
    name: string;
}

export interface WebRTCStartMonitorEvent {
    type: 'start-monitor';
}

export interface WebRTCUnregisterEvent {
    type: 'unregister';
}

export interface WebRTCStopMonitorEvent {
    type: 'stop-monitor';
}

export interface WebRTCSetPlayerNumber {
    type: 'set-player-number';
    playerNumber: number | null;
}

export interface WebRTCNewFrequencyEvent {
    type: 'freq';
    freqs: [number, number];
    volumes: [number, number];
}

export type keyStrokes = 'up' | 'down' | 'left' | 'right' | 'Enter' | 'Backspace' | 'Shift+R';

export interface WebRTCKeyStrokeEvent {
    type: 'keystroke';
    key: keyStrokes;
}
export interface WebRTCRemoteKeyboardEvent {
    type: 'keyboard-layout';
    help: HelpEntry | undefined;
}

export type WebRTCEvents =
    | WebRTCSetPlayerNumber
    | WebRTCRegisterEvent
    | WebRTCStartMonitorEvent
    | WebRTCStopMonitorEvent
    | WebRTCKeyStrokeEvent
    | WebRTCRemoteKeyboardEvent
    | WebRTCNewFrequencyEvent;
