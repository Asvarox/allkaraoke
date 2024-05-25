/*
 * Polyfill for Array.prototype.at - very naive one to support old Safari.
 * Including core-js or other polyfill libraries increases bundle size
 */
export function atPolyfill<T>(array: T[], index: number): T | undefined {
  const indexToUse = index < 0 ? array.length + index : index;
  return array[indexToUse];
}

if (![].at) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.at = function (index: number) {
    return atPolyfill(this, index);
  };
}
