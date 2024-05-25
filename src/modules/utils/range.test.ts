import range from 'modules/utils/range';

describe('range', () => {
  it('should generate 10 element array', () => {
    expect(range(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
