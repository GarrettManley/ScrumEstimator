import { Deck, isNumericDeck, isNumericValue, isSpecialValue } from './deck';

export interface RoundResults {
  /** Number of votes cast. */
  voterCount: number;
  /** Count of votes per card value. */
  distribution: Record<string, number>;
  /** Value(s) tied for the highest count (empty when there are no votes). */
  mode: string[];
  /** Mean of numeric votes — only for numeric decks with at least one numeric vote. */
  mean?: number;
  /** True when >= 2 voters all cast the same estimate (special cards never form consensus). */
  consensus: boolean;
}

/**
 * Aggregate cast votes for a round. Pure and deck-aware:
 * - numeric decks get a `mean` over numeric votes ('?'/'☕' excluded);
 * - non-numeric decks get no mean;
 * - consensus requires at least two voters in unanimous agreement on an estimate;
 * - degenerate rounds (no voters, a lone voter) never report consensus.
 */
export function computeResults(votes: string[], deck: Deck): RoundResults {
  const voterCount = votes.length;

  const distribution: Record<string, number> = {};
  for (const v of votes) {
    distribution[v] = (distribution[v] ?? 0) + 1;
  }

  const counts = Object.values(distribution);
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
  const mode = Object.keys(distribution).filter((v) => distribution[v] === maxCount);

  let mean: number | undefined;
  if (isNumericDeck(deck)) {
    const nums = votes.filter(isNumericValue).map(Number);
    if (nums.length > 0) {
      mean = nums.reduce((sum, n) => sum + n, 0) / nums.length;
    }
  }

  const distinct = new Set(votes);
  const consensus = voterCount >= 2 && distinct.size === 1 && !isSpecialValue(votes[0]);

  return { voterCount, distribution, mode, mean, consensus };
}
