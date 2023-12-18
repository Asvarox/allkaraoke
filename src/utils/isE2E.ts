const wasE2E = sessionStorage.getItem('isE2E');
export default function isE2E() {
  if (wasE2E) {
    return true;
  }
  const isE2E = window.isE2ETests || window.location.search.includes('e2e-test');
  if (isE2E) {
    sessionStorage.setItem('isE2E', 'true');
  }
  return isE2E;
}
