import { Timestamp } from 'firebase/firestore';
import { roundsToCsv } from './csv';
import { Round } from './models';
import { presetDeck } from '../domain/deck';

function round(title: string, results: Round['results']): Round {
  return {
    createdAt: Timestamp.fromMillis(0),
    story: { title, description: '' },
    deck: presetDeck('fib'),
    status: 'revealed',
    results,
  };
}

describe('roundsToCsv', () => {
  it('writes a header and one row per round', () => {
    const csv = roundsToCsv([
      round('Login', { voterCount: 3, distribution: { '5': 3 }, mode: ['5'], mean: 5, consensus: true }),
    ]);
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Story,Votes,Average,Most common,Consensus');
    expect(lines[1]).toBe('Login,3,5.00,5,yes');
  });

  it('quotes fields containing commas or quotes', () => {
    const csv = roundsToCsv([
      round('Add "search", fast', { voterCount: 1, distribution: { '8': 1 }, mode: ['8'], mean: 8, consensus: false }),
    ]);
    expect(csv.split('\r\n')[1]).toContain('"Add ""search"", fast"');
  });
});
