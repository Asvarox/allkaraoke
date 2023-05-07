import { useHotkeys } from 'react-hotkeys-hook';
import { useEventEffect } from 'GameEvents/hooks';
import events from 'GameEvents/GameEvents';

type Callback = (e?: KeyboardEvent) => void;

// All besides H (help) character
export const REGULAR_ALPHA_CHARS = 'a,b,c,d,e,f,g,i,j,k,l,m,n,o,p,r,s,t,u,w,x,y,z';

// @ts-expect-error
navigator?.keyboard?.lock(['Escape']);

// @ts-expect-error
export const supportsEscAsBack = !!navigator?.keyboard?.lock;

export interface Params {
    up?: Callback;
    down?: Callback;
    left?: Callback;
    right?: Callback;
    accept?: Callback;
    back?: Callback;
    random?: Callback;
    // alphanumeric?: () => void,
}

const paramsToKeys: { [param in keyof Params]: string[] } = {
    up: ['up'],
    down: ['down'],
    left: ['left'],
    right: ['right'],
    accept: ['Enter'],
    back: ['Backspace', 'Escape'],
    random: ['Shift+R'],
};

const keyToParam = (keyCode: string): keyof Params | null => {
    return (Object.entries(paramsToKeys).find(([key, val]) => val.includes(keyCode))?.[0] as keyof Params) ?? null;
};

export default function useKeyboard(params: Params, enabled = true, deps?: any[]) {
    let handledKeys: string = Object.keys(params)
        .map((param) => paramsToKeys[param as keyof Params])
        .join(',');

    useEventEffect(events.remoteKeyboardPressed, (param) => {
        if (enabled) {
            if (param in params) {
                params[param]?.();
            }
        }
    });

    useHotkeys(
        handledKeys,
        (event, hkEvent) => {
            const param = keyToParam(hkEvent.key);

            if (!param) return;

            if (param in params) {
                event.preventDefault();
                event.stopPropagation();
                params[param]?.(event);
            }
        },
        { enabled },
        deps,
    );
}
