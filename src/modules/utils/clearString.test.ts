import clearString, { removeAccents } from '~/modules/utils/clearString';

describe('clearString', () => {
  it('should remove accents for common latin characters', () => {
    expect(removeAccents('Crème brûlée año für')).toBe('Creme brulee ano fuer');
  });

  it('should keep only alphanumeric lowercase characters', () => {
    expect(clearString('Beyoncé - Déjà Vu! 2026')).toBe('beyoncedejavu2026');
  });
});
