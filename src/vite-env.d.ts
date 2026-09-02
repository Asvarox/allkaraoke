/// <reference types="vite/client" />

declare namespace globalThis {
  var chrome: any;
  var isE2ETests: boolean | undefined;
  /** Set by `enableLeaderboard` in tests/helpers.ts — the e2e stand-in for the PostHog flag. */
  var isE2ELeaderboard: boolean | undefined;
  /** Opts a spec into the server-authoritative online mode; e2e runs P2P otherwise. */
  var isE2EOnlineServerMode: boolean | undefined;
  /** Set by `enableSongLeaderboard` in tests/helpers.ts — the e2e stand-in for the PostHog flag. */
  var isE2ESongLeaderboard: boolean | undefined;

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
