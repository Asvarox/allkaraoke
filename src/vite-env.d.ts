/// <reference types="vite/client" />

declare namespace globalThis {
  var chrome: any;
  var isE2ETests: boolean | undefined;
  /** Set by `enableAutoMobileMode` in tests/helpers.ts — the e2e stand-in for the experiment. */
  var isE2EAutoMobileMode: boolean | undefined;
  /** Makes rooms a spec opens server-mode ones; e2e opens P2P rooms otherwise. Joining ignores it. */
  var isE2EOnlineServerMode: boolean | undefined;

  // See https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1615
  type OrientationLockType =
    | 'any'
    | 'landscape'
    | 'landscape-primary'
    | 'landscape-secondary'
    | 'natural'
    | 'portrait'
    | 'portrait-primary'
    | 'portrait-secondary';
  interface ScreenOrientation {
    lock?: (direction: OrientationLockType) => Promise<void>;
  }

  interface Navigator {
    connection?: {
      type: 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';
      addEventListener?: (event: 'change', listener: () => void) => void;
      removeEventListener?: (event: 'change', listener: () => void) => void;
    };
  }
}
