import { Deck, snapToDeck } from '../domain/deck';
import { Story } from '../room/models';

export interface AiSuggestion {
  points: string;
  rationale: string;
}

export type AiErrorKind = 'no-key' | 'auth' | 'rate-limit' | 'network' | 'invalid';

export class AiError extends Error {
  constructor(
    readonly kind: AiErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'AiError';
  }
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

/** Verified against the in-context model registry; swap centrally if it changes. */
export const DEFAULT_MODEL = 'claude-sonnet-4-6';

export interface SuggestParams {
  apiKey: string;
  story: Story;
  deck: Deck;
  model?: string;
  /** Injectable for testing; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

interface ToolUseBlock {
  type: string;
  name?: string;
  input?: { points?: unknown; rationale?: unknown };
}

/**
 * Ask Claude for a story-point estimate, calling the Anthropic API directly from
 * the browser with the user's own key. The returned value is forced onto the deck
 * (snap for numeric decks, reject otherwise) so it is always castable.
 */
export async function suggestEstimate(params: SuggestParams): Promise<AiSuggestion> {
  const { apiKey, story, deck, model = DEFAULT_MODEL, fetchImpl = fetch } = params;
  if (!apiKey) {
    throw new AiError('no-key', 'No API key set');
  }

  const tool = {
    name: 'provide_estimate',
    description: 'Provide a story-point estimate chosen from the allowed deck values.',
    input_schema: {
      type: 'object',
      properties: {
        points: {
          type: 'string',
          enum: deck.values,
          description: 'The estimate — exactly one of the allowed deck values.',
        },
        rationale: {
          type: 'string',
          description: 'One or two sentences explaining the estimate.',
        },
      },
      required: ['points', 'rationale'],
    },
  };

  const prompt =
    `You are an agile estimation assistant. Estimate the relative effort of this user ` +
    `story using ONLY the allowed deck values: ${deck.values.join(', ')}.\n\n` +
    `Title: ${story.title || '(untitled)'}\n` +
    `Description: ${story.description || '(none)'}\n\n` +
    `Call the provide_estimate tool with your chosen value and a short rationale.`;

  let res: Response;
  try {
    res = await fetchImpl(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 512,
        tools: [tool],
        tool_choice: { type: 'tool', name: 'provide_estimate' },
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch {
    throw new AiError('network', 'Network error contacting Claude.');
  }

  if (res.status === 401 || res.status === 403) {
    throw new AiError('auth', 'Invalid API key.');
  }
  if (res.status === 429) {
    throw new AiError('rate-limit', 'Rate limited — try again shortly.');
  }
  if (!res.ok) {
    throw new AiError('network', `Claude returned ${res.status}.`);
  }

  const data = (await res.json()) as { content?: ToolUseBlock[] };
  const block = (data.content ?? []).find((b) => b.type === 'tool_use');
  const rawPoints = block?.input?.points;
  const rationale = String(block?.input?.rationale ?? '').trim();

  const snapped = rawPoints != null ? snapToDeck(String(rawPoints), deck) : null;
  if (!snapped) {
    throw new AiError('invalid', `Claude returned an estimate that doesn't fit this deck.`);
  }
  return { points: snapped, rationale };
}
