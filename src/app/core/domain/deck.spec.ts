import {
  classifyDeck,
  customDeck,
  isNumericValue,
  isSpecialValue,
  presetDeck,
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
