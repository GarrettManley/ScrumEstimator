import {
  classifyDeck,
  customDeck,
  isNumericValue,
  isSpecialValue,
  presetDeck,
  snapToDeck,
} from './deck';

describe('deck values', () => {
  it('treats ? and coffee as special (non-estimate) values', () => {
    expect(isSpecialValue('?')).toBe(true);
    expect(isSpecialValue('☕')).toBe(true);
    expect(isSpecialValue('5')).toBe(false);
    expect(isSpecialValue('M')).toBe(false);
  });

  it('recognises numeric estimate values', () => {
    expect(isNumericValue('5')).toBe(true);
    expect(isNumericValue('0')).toBe(true);
    expect(isNumericValue('13')).toBe(true);
    expect(isNumericValue('?')).toBe(false);
    expect(isNumericValue('M')).toBe(false);
    expect(isNumericValue('')).toBe(false);
    expect(isNumericValue('  ')).toBe(false);
  });
});

describe('classifyDeck', () => {
  it('classifies Fibonacci as numeric despite the ? card', () => {
    expect(classifyDeck(presetDeck('fib'))).toBe('numeric');
  });

  it('classifies powers-of-2 as numeric', () => {
    expect(classifyDeck(presetDeck('pow2'))).toBe('numeric');
  });

  it('classifies T-shirt sizes as non-numeric', () => {
    expect(classifyDeck(presetDeck('tshirt'))).toBe('non-numeric');
  });

  it('classifies an all-numeric custom deck as numeric', () => {
    expect(classifyDeck(customDeck(['1', '2', '4', '?']))).toBe('numeric');
  });

  it('classifies a mixed custom deck as non-numeric', () => {
    expect(classifyDeck(customDeck(['1', '2', 'big']))).toBe('non-numeric');
  });

  it('classifies a deck of only special values as non-numeric', () => {
    expect(classifyDeck(customDeck(['?', '☕']))).toBe('non-numeric');
  });
});

describe('customDeck', () => {
  it('trims blanks and de-duplicates while preserving order', () => {
    expect(customDeck([' 1 ', '2', '2', '', '3']).values).toEqual(['1', '2', '3']);
  });
});

describe('snapToDeck', () => {
  const fib = presetDeck('fib');
  const tshirt = presetDeck('tshirt');

  it('passes through an exact deck value', () => {
    expect(snapToDeck('8', fib)).toBe('8');
    expect(snapToDeck('M', tshirt)).toBe('M');
  });

  it('snaps an off-deck numeric value to the nearest deck value', () => {
    expect(snapToDeck('7', fib)).toBe('8'); // 7 is closer to 8 than 5
    expect(snapToDeck('4', fib)).toBe('3'); // equidistant 3 vs 5 — first-best (3) wins
  });

  it('rejects a non-numeric value that is not in the deck', () => {
    expect(snapToDeck('Medium', tshirt)).toBeNull();
  });

  it('rejects a numeric value for a non-numeric deck', () => {
    expect(snapToDeck('5', tshirt)).toBeNull();
  });
});
