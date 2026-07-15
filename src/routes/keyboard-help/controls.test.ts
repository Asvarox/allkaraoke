import { describe, expect, it } from 'vitest';

import { assertNever, ControlDescriptor, isValidControl } from '~/routes/keyboard-help/controls';

describe('control descriptors', () => {
  it('accepts well-formed descriptors of every type', () => {
    const controls: ControlDescriptor[] = [
      { type: 'button', name: 'a', label: 'A' },
      { type: 'switch', name: 'b', label: 'B', value: 'HIGH' },
      { type: 'checkbox', name: 'c', label: 'C', checked: true },
    ];
    expect(controls.every(isValidControl)).toBe(true);
  });

  it('rejects malformed descriptors', () => {
    expect(isValidControl({ type: 'switch', name: 'b', label: 'B' } as unknown as ControlDescriptor)).toBe(false);
    expect(isValidControl({ type: 'checkbox', name: 'c', label: 'C' } as unknown as ControlDescriptor)).toBe(false);
    expect(isValidControl({ type: 'button', name: '', label: 'A' } as ControlDescriptor)).toBe(false);
    expect(isValidControl({ type: 'nope', name: 'x', label: 'X' } as unknown as ControlDescriptor)).toBe(false);
  });

  it('assertNever throws when reached at runtime', () => {
    expect(() => assertNever('unexpected' as never)).toThrow();
  });
});
