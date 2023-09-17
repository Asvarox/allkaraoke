/// <reference types="vite/client" />

declare namespace globalThis {
  interface Window {
    chrome: any;
    isE2ETests?: boolean;
  }

  interface Navigator {
    connection: any;
  }
}
