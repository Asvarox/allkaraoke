import { describe, expect, it } from 'vitest';

import { fixDiacritics } from './fix-diacritics';

describe('fixDiacritics', () => {
  it('should fix Polish accents', () => {
    expect(fixDiacritics('¯ó³ty', 'polish')).toBe('Żółty');
    expect(fixDiacritics('Z¹b', 'polish')).toBe('Ząb');
  });

  it('should fix Spanish accents', () => {
    expect(fixDiacritics('canciÛn', 'spanish')).toBe('canción');
    expect(fixDiacritics('øQuiÈn?', 'spanish')).toBe('¿Quién?');
  });

  it('should fix French accents', () => {
    expect(fixDiacritics("l'atmosphËre", 'french')).toBe("l'atmosphère");
    expect(fixDiacritics('ArrÍter', 'french')).toBe('Arrêter');
    expect(fixDiacritics('supplÈmentaires', 'french')).toBe('supplémentaires');
    expect(fixDiacritics('cúur', 'french')).toBe('cœur');
    expect(fixDiacritics('PrÍt·‡·apprendre', 'french')).toBe('Prêt·à·apprendre');
  });
});
