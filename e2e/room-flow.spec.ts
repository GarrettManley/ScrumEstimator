import { Browser, expect, test } from '@playwright/test';

async function createRoom(browser: Browser, name: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await page.getByLabel('Your name').fill(name);
  await page.getByRole('button', { name: 'Create room' }).click();
  await page.waitForURL(/\/room\//);
  return { context, page, url: page.url() };
}

test('two players vote and the facilitator reveals results in real time', async ({ browser }) => {
  // Facilitator creates a room.
  const fac = await createRoom(browser, 'Alice');

  // Second player joins via the shared link (separate anonymous identity).
  const voterContext = await browser.newContext();
  const voter = await voterContext.newPage();
  await voter.goto(fac.url);
  await voter.getByLabel('Your name').fill('Bob');
  await voter.getByRole('button', { name: 'Join' }).click();

  // Presence syncs: the facilitator sees the joiner appear.
  await expect(fac.page.getByText('Bob')).toBeVisible();

  // Both cast hidden votes.
  await fac.page.getByRole('button', { name: '5', exact: true }).click();
  await voter.getByRole('button', { name: '8', exact: true }).click();

  // Before reveal, the non-facilitator cannot see the tally.
  await expect(voter.getByText('Waiting for the facilitator')).toBeVisible();

  // Facilitator reveals; results propagate to both clients.
  await fac.page.getByRole('button', { name: 'Reveal votes' }).click();
  await expect(fac.page.getByText('Votes cast: 2')).toBeVisible();
  await expect(voter.getByText('Votes cast: 2')).toBeVisible();
  await expect(fac.page.getByText('No consensus')).toBeVisible();

  // Facilitator starts a new round; both return to voting.
  await fac.page.getByRole('button', { name: 'New round' }).click();
  await expect(fac.page.getByRole('button', { name: 'Reveal votes' })).toBeVisible();
  await expect(voter.getByText('Waiting for the facilitator')).toBeVisible();

  // The completed round now shows in history for both clients (5 + 8 → avg 6.5).
  await expect(fac.page.getByText('History')).toBeVisible();
  await expect(voter.getByText('avg 6.5')).toBeVisible();

  await fac.context.close();
  await voterContext.close();
});
