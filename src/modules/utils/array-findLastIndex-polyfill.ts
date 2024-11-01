/*
 * Polyfill for Array.prototype.findLastIndex - very naive one to support old Chrome.
 * Including core-js or other polyfill libraries increases bundle size
 */
if (![].findLastIndex) {
  Array.prototype.findLastIndex = function (callback, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (callback.call(thisArg, this[i], i, this)) return i;
    }
    return -1;
  };
}
