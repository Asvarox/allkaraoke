export default function isE2E() {
    // @ts-expect-error
    return window.isE2ETests || window.location.search.includes('e2e-test');
}
