import { invert } from 'lodash-es';
import { useHotkeys } from 'react-hotkeys-hook';

type Callback = (e: KeyboardEvent) => void;

// All besides F and H characters
export const REGULAR_ALPHA_CHARS = 'a,b,c,d,e,f,g,i,j,k,l,m,n,o,p,r,s,t,u,w,x,y,z';

interface Params {
    onUpArrow?: Callback;
    onDownArrow?: Callback;
    onLeftArrow?: Callback;
    onRightArrow?: Callback;
    onEnter?: Callback;
    onBackspace?: Callback;
    onR?: Callback;
    // onAlphaNumeric?: () => void,
}

const paramsToKeys: { [param in keyof Params]: string } = {
    onUpArrow: 'up',
    onDownArrow: 'down',
    onLeftArrow: 'left',
    onRightArrow: 'right',
    onEnter: 'Enter',
    onBackspace: 'Backspace',
    onR: 'Shift+R',
};

const keysToParams: { [key: string]: keyof Params } = invert(paramsToKeys) as any;

export default function useKeyboard(params: Params, enabled = true, deps?: any[]) {
    let handledKeys: string = Object.keys(params)
        .map((param) => paramsToKeys[param as keyof Params])
        .join(',');

    useHotkeys(
        handledKeys,
        (event, hkEvent) => {
            const param = keysToParams[hkEvent.key];

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
