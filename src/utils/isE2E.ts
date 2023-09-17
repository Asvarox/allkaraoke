export default function isE2E() {
  return window.isE2ETests || window.location.search.includes('e2e-test');
}
