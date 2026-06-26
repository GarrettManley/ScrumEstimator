import { AiError, suggestEstimate } from './claude';
import { presetDeck } from '../domain/deck';

const fib = presetDeck('fib');
const tshirt = presetDeck('tshirt');
const story = { title: 'Add login', description: 'OAuth flow' };

function fakeFetch(status: number, body: unknown): typeof fetch {
  return (async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    })) as unknown as typeof fetch;
}

function toolResponse(points: string, rationale = 'because') {
  return {
    content: [{ type: 'tool_use', name: 'provide_estimate', input: { points, rationale } }],
  };
}

describe('suggestEstimate', () => {
  it('returns the suggestion when the model picks an in-deck value', async () => {
    const out = await suggestEstimate({
      apiKey: 'k',
      story,
      deck: fib,
      fetchImpl: fakeFetch(200, toolResponse('5', 'small change')),
    });
    expect(out).toEqual({ points: '5', rationale: 'small change' });
  });

  it('snaps an off-deck numeric estimate to the nearest deck value', async () => {
    const out = await suggestEstimate({
      apiKey: 'k',
      story,
      deck: fib,
      fetchImpl: fakeFetch(200, toolResponse('7')),
    });
    expect(out.points).toBe('8');
  });

  it('rejects an estimate that cannot map to a non-numeric deck', async () => {
    await expect(
      suggestEstimate({
        apiKey: 'k',
        story,
        deck: tshirt,
        fetchImpl: fakeFetch(200, toolResponse('Medium')),
      }),
    ).rejects.toMatchObject({ kind: 'invalid' });
  });

  it('throws no-key when the api key is empty', async () => {
    await expect(
      suggestEstimate({
        apiKey: '',
        story,
        deck: fib,
        fetchImpl: fakeFetch(200, toolResponse('5')),
      }),
    ).rejects.toMatchObject({ kind: 'no-key' });
  });

  it('maps 401 to an auth error', async () => {
    await expect(
      suggestEstimate({ apiKey: 'bad', story, deck: fib, fetchImpl: fakeFetch(401, {}) }),
    ).rejects.toMatchObject({ kind: 'auth' });
  });

  it('maps 429 to a rate-limit error', async () => {
    await expect(
      suggestEstimate({ apiKey: 'k', story, deck: fib, fetchImpl: fakeFetch(429, {}) }),
    ).rejects.toMatchObject({ kind: 'rate-limit' });
  });

  it('maps a thrown fetch to a network error', async () => {
    const throwing = (async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;
    await expect(
      suggestEstimate({ apiKey: 'k', story, deck: fib, fetchImpl: throwing }),
    ).rejects.toBeInstanceOf(AiError);
  });
});
