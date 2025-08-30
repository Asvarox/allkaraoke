const wasE2E = globalThis?.sessionStorage?.getItem('isE2E');
const isE2EParamPresent = globalThis?.location?.search.includes('e2e-test');
export default function isE2E() {
  if (wasE2E) {
    return true;
  }
  const isE2E = globalThis?.isE2ETests || isE2EParamPresent;
  if (isE2E) {
    globalThis?.sessionStorage?.setItem('isE2E', 'true');
  }
  return isE2E;
}
