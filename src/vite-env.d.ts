/// <reference types="vite/client" />

// Served by scripts/vite-plugin-bundled-icons.ts: the data of every icon in ICON_NAMES
declare module 'virtual:icon-collections' {
  const collections: import('@iconify-icon/react').IconifyJSON[];
  export default collections;
}

declare namespace globalThis {
  var chrome: any;
  var isE2ETests: boolean | undefined;
  /** Set by `enableAutoMobileMode` in tests/helpers.ts — the e2e stand-in for the experiment. */
  var isE2EAutoMobileMode: boolean | undefined;
  /** Set by `useRealtimeRemoteMics` in tests/helpers.ts — new game codes use the Realtime transport. */
  var isE2ERemoteMicsRealtime: boolean | undefined;
  /** E2E-only, see src/modules/songs/stats/event-listeners.ts */
  var __storeSongStats:
    | ((songId: string, stats: import('~/modules/songs/stats/common').SongStats) => Promise<void>)
    | undefined;

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
