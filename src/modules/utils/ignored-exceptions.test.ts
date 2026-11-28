import { hasIgnoredException, hasSampledException, isIgnoredException } from '~/modules/utils/ignored-exceptions';

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

  it('does not ignore exceptions that are only sampled', () => {
    expect(hasIgnoredException([{ type: 'NotFoundError', value: 'Requested device not found' }])).toBe(false);
  });
});

describe('hasSampledException', () => {
  it('matches sampled exceptions with the type prefix', () => {
    expect(hasSampledException([{ type: 'NotAllowedError', value: 'Permission dismissed' }])).toBe(true);
    expect(hasSampledException([{ type: 'Error', value: 'Script error.' }])).toBe(true);
  });

  it('does not match ignored or unrelated errors', () => {
    expect(hasSampledException([{ type: 'TypeError', value: 'Failed to fetch' }])).toBe(false);
    expect(hasSampledException([{ type: 'Error', value: 'Something real broke' }])).toBe(false);
  });
});
