import { invert } from 'lodash';
import { useHotkeys } from 'react-hotkeys-hook';

interface Params {
    onUpArrow?: () => void;
    onDownArrow?: () => void;
    onLeftArrow?: () => void;
    onRightArrow?: () => void;
    onEnter?: () => void;
    onBackspace?: () => void;
    // onAlphaNumeric?: () => void,
}

const paramsToKeys: { [param in keyof Params]: string } = {
    onUpArrow: 'up',
    onDownArrow: 'down',
    onLeftArrow: 'left',
    onRightArrow: 'right',
    onEnter: 'Enter',
    onBackspace: 'Backspace',
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
                params[param]?.();
            }
        },
        { enabled },
        deps,
    );
}
