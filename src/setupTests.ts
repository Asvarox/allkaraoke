// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

// Taken from https://github.com/tc39/proposal-relative-indexing-method#polyfill
// node-canvas doesn't work on node 16, so it's needed here
function at(n: number) {
    // ToInteger() abstract op
    n = Math.trunc(n) || 0;
    // Allow negative indexing from the end
    // @ts-ignore
    if (n < 0) n += this.length;
    // OOB access is guaranteed to return undefined
    // @ts-ignore
    if (n < 0 || n >= this.length) return undefined;
    // Otherwise, this is just normal property access
    // @ts-ignore
    return this[n];
}

const TypedArray = Reflect.getPrototypeOf(Int8Array);
for (const C of [Array, String, TypedArray]) {
    // @ts-ignore
    Object.defineProperty(C.prototype, 'at', { value: at, writable: true, enumerable: false, configurable: true });
}
