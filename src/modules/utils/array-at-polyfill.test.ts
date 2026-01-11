import { atPolyfill } from '~/modules/utils/array-at-polyfill';

describe('Array.at polyfill', () => {
  it('should return the element at the given index', () => {
    expect(atPolyfill([1, 2, 3], 1)).toBe(2);
  });
  it('should return the element at the given negative index', () => {
    expect(atPolyfill([1, 2, 3], -1)).toBe(3);
  });
  it('should return undefined if the index is out of bounds', () => {
    expect(atPolyfill([1, 2, 3], 5)).toBeUndefined();
    expect(atPolyfill([1, 2, 3], -5)).toBeUndefined();
  });
});
