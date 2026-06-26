import { computeResults } from './consensus';
import { customDeck, presetDeck } from './deck';

const fib = presetDeck('fib');
const tshirt = presetDeck('tshirt');

describe('computeResults — numeric deck', () => {
  it('reports unanimous estimates as consensus with a matching mean', () => {
    const r = computeResults(['5', '5', '5'], fib);
    expect(r.consensus).toBe(true);
    expect(r.mean).toBe(5);
    expect(r.mode).toEqual(['5']);
    expect(r.distribution).toEqual({ '5': 3 });
  });

  it('averages mixed numeric votes and reports no consensus', () => {
    const r = computeResults(['2', '4', '3', '3'], fib);
    expect(r.consensus).toBe(false);
    expect(r.mean).toBe(3); // (2+4+3+3)/4
    expect(r.mode).toEqual(['3']);
  });

  it('excludes ? from the mean but keeps it in the distribution', () => {
    const r = computeResults(['8', '8', '?'], fib);
    expect(r.mean).toBe(8); // ? not counted
    expect(r.distribution).toEqual({ '8': 2, '?': 1 });
    expect(r.consensus).toBe(false); // not unanimous
  });

  it('returns no mean and no consensus when everyone abstains', () => {
    const r = computeResults(['?', '?'], fib);
    expect(r.mean).toBeUndefined();
    expect(r.consensus).toBe(false);
    expect(r.mode).toEqual(['?']);
  });

  it('exposes tied modes', () => {
    const r = computeResults(['2', '2', '5', '5'], fib);
    expect(r.mode.sort()).toEqual(['2', '5']);
  });
});

describe('computeResults — non-numeric deck', () => {
  it('never produces a mean', () => {
    const r = computeResults(['M', 'M', 'L'], tshirt);
    expect(r.mean).toBeUndefined();
    expect(r.mode).toEqual(['M']);
    expect(r.consensus).toBe(false);
  });

  it('reports consensus on a unanimous size', () => {
    const r = computeResults(['L', 'L'], tshirt);
    expect(r.consensus).toBe(true);
    expect(r.mean).toBeUndefined();
  });
});

describe('computeResults — degenerate rounds', () => {
  it('handles zero voters without NaN', () => {
    const r = computeResults([], fib);
    expect(r.voterCount).toBe(0);
    expect(r.mean).toBeUndefined();
    expect(r.mode).toEqual([]);
    expect(r.consensus).toBe(false);
    expect(r.distribution).toEqual({});
  });

  it('does not call a lone voter a consensus', () => {
    const r = computeResults(['5'], fib);
    expect(r.consensus).toBe(false);
    expect(r.mean).toBe(5);
  });
});

describe('computeResults — custom numeric deck', () => {
  it('averages an all-numeric custom deck', () => {
    const r = computeResults(['1', '2', '4'], customDeck(['1', '2', '4']));
    expect(r.mean).toBeCloseTo(2.333, 2);
  });
});
