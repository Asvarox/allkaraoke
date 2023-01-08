declare namespace globalThis {
    interface Window {
        chrome: any;
        isE2ETests?: boolean;
    }
}
