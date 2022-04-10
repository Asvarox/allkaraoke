import { invert } from 'lodash';
import { useHotkeys } from 'react-hotkeys-hook';

type Callback = (e: KeyboardEvent) => void;

interface Params {
    onUpArrow?: Callback;
    onDownArrow?: Callback;
    onLeftArrow?: Callback;
    onRightArrow?: Callback;
    onEnter?: Callback;
    onBackspace?: Callback;
    onLetterF?: Callback;
    // onAlphaNumeric?: () => void,
}

const paramsToKeys: { [param in keyof Params]: string } = {
    onUpArrow: 'up',
    onDownArrow: 'down',
    onLeftArrow: 'left',
    onRightArrow: 'right',
    onEnter: 'Enter',
    onBackspace: 'Backspace',
    onLetterF: 'F',
};

const keysToParams: { [key: string]: keyof Params } = invert(paramsToKeys) as any;

export default function useKeyboardNav(params: Params, enabled = true, deps?: any[]) {
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
