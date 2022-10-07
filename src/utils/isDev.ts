export default function isDev() {
    // @ts-expect-error
    return process.env.NODE_ENV === 'development' && !window.isE2ETests;
}
