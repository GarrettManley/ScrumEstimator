/** A card deck used for estimation. */
export type DeckType = 'fib' | 'pow2' | 'tshirt' | 'custom';

export interface Deck {
  type: DeckType;
  values: string[];
}

/**
 * Cards that represent "no estimate" (unsure / step away) rather than a value.
 * They never count toward the numeric mean and never form a consensus.
 */
export const SPECIAL_VALUES = ['?', '☕'] as const;

/** Built-in preset decks. The `?` card is an abstain, not a numeric value. */
export const DECK_PRESETS = {
  fib: ['0', '1', '2', '3', '5', '8', '13', '21', '?'],
  pow2: ['0', '1', '2', '4', '8', '16', '32', '?'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', '?'],
} as const satisfies Record<Exclude<DeckType, 'custom'>, string[]>;

export function isSpecialValue(value: string): boolean {
  return (SPECIAL_VALUES as readonly string[]).includes(value);
}

/** True when a value contributes to numeric aggregation (not special, parses as a finite number). */
export function isNumericValue(value: string): boolean {
  if (isSpecialValue(value)) {
    return false;
  }
  return value.trim() !== '' && Number.isFinite(Number(value));
}

/** A deck is numeric iff every non-special value parses as a number (so Fibonacci with `?` is numeric). */
export function classifyDeck(deck: Deck): 'numeric' | 'non-numeric' {
  const meaningful = deck.values.filter((v) => !isSpecialValue(v));
  const numeric = meaningful.length > 0 && meaningful.every(isNumericValue);
  return numeric ? 'numeric' : 'non-numeric';
}

export function isNumericDeck(deck: Deck): boolean {
  return classifyDeck(deck) === 'numeric';
}

export function presetDeck(type: Exclude<DeckType, 'custom'>): Deck {
  return { type, values: [...DECK_PRESETS[type]] };
}

/** Build a custom deck from raw values, trimming blanks and de-duplicating while preserving order. */
export function customDeck(values: string[]): Deck {
  const cleaned: string[] = [];
  for (const raw of values) {
    const v = raw.trim();
    if (v !== '' && !cleaned.includes(v)) {
      cleaned.push(v);
    }
  }
  return { type: 'custom', values: cleaned };
}
