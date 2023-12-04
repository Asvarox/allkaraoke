import events from 'GameEvents/GameEvents';
import { useEventEffect } from 'GameEvents/hooks';
import { useHotkeys } from 'react-hotkeys-hook';

type Callback = (e?: KeyboardEvent) => void;

// All besides H (help) character
export const REGULAR_ALPHA_CHARS = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,r,s,t,u,w,x,y,z,1,2,3,4,5,6,7,8,9,0';

try {
  // @ts-expect-error
  navigator?.keyboard?.lock?.(['Escape']);
} catch (e) {
  console.warn(e);
}

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

const cb = (callback?: Callback) => (e: KeyboardEvent) => {
  if (callback) {
    e.preventDefault();
    e.stopPropagation();
    callback(e);
  }
};

// useHotkeys doesn't seem to be updatable to 4.0 due to https://github.com/JohannesKlauss/react-hotkeys-hook/issues/1074
export default function useKeyboard(params: Params, enabled = true, deps?: any[]) {
  useEventEffect(events.remoteKeyboardPressed, (param) => {
    if (enabled) {
      if (param in params) {
        params[param]?.();
      }
    }
  });

  useHotkeys('up', cb(params.up), { enabled: enabled && !!params?.up }, deps);
  useHotkeys('down', cb(params.down), { enabled: enabled && !!params?.down }, deps);
  useHotkeys('left', cb(params.left), { enabled: enabled && !!params?.left }, deps);
  useHotkeys('right', cb(params.right), { enabled: enabled && !!params?.right }, deps);
  useHotkeys('Enter', cb(params.accept), { enabled: enabled && !!params?.accept }, deps);
  useHotkeys('Escape,Backspace', cb(params.back), { enabled: enabled && !!params?.back }, deps);
  useHotkeys('Shift+R', cb(params.random), { enabled: enabled && !!params?.random }, deps);
}
