import { hasIgnoredException, isIgnoredException } from '~/modules/utils/ignored-exceptions';

describe('isIgnoredException', () => {
  it('ignores empty messages', () => {
    expect(isIgnoredException(undefined)).toBe(false);
    expect(isIgnoredException('')).toBe(false);
  });
});

describe('hasIgnoredException', () => {
  it('matches on the value of an exception list item', () => {
    expect(hasIgnoredException([{ type: 'Error', value: 'Transport disconnected during RPC: songs.sendMyList' }])).toBe(
      true,
    );
  });

  it('matches patterns that include the type prefix', () => {
    expect(hasIgnoredException([{ type: 'TypeError', value: 'Failed to fetch' }])).toBe(true);
  });

  it('does not match unrelated errors', () => {
    expect(hasIgnoredException([{ type: 'Error', value: 'Something real broke' }])).toBe(false);
    expect(hasIgnoredException([])).toBe(false);
  });
});
