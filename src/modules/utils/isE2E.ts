const wasE2E = global?.sessionStorage?.getItem('isE2E');
const isE2EParamPresent = global?.location?.search.includes('e2e-test');
export default function isE2E() {
  if (wasE2E) {
    return true;
  }
  const isE2E = global?.isE2ETests || isE2EParamPresent;
  if (isE2E) {
    global?.sessionStorage?.setItem('isE2E', 'true');
  }
  return isE2E;
}
