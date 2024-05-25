const wasE2E = global?.sessionStorage?.getItem('isE2E');
export default function isE2E() {
  if (wasE2E) {
    return true;
  }
  const isE2E = global?.isE2ETests || global?.location?.search.includes('e2e-test');
  if (isE2E) {
    global?.sessionStorage?.setItem('isE2E', 'true');
  }
  return isE2E;
}
