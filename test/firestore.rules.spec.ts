import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const FIB = ['0', '1', '2', '3', '5', '8', '13', '21', '?'];
const ROOM = 'room1';
const ROUND = 'r1';

let env: RulesTestEnvironment;

const roomPath = `rooms/${ROOM}`;
const roundPath = `rooms/${ROOM}/rounds/${ROUND}`;
const votePath = (uid: string) => `rooms/${ROOM}/rounds/${ROUND}/votes/${uid}`;

function db(uid?: string) {
  return uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore();
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-scrum',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  // Seed a room owned by `fac` with an open round, bypassing rules.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const f = ctx.firestore();
    await setDoc(doc(f, roomPath), {
      facilitatorUid: 'fac',
      deck: { type: 'fib', values: FIB },
      currentRoundId: ROUND,
    });
    await setDoc(doc(f, roundPath), {
      story: { title: '', description: '' },
      deck: { type: 'fib', values: FIB },
      status: 'voting',
    });
  });
});

async function revealRound() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await updateDoc(doc(ctx.firestore(), roundPath), { status: 'revealed' });
  });
}

async function seedVote(uid: string, value: string) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), votePath(uid)), { value });
  });
}

describe('rooms', () => {
  it('denies reads to unauthenticated users', async () => {
    await assertFails(getDoc(doc(db(), roomPath)));
  });

  it('allows any signed-in user to read a room (join via link)', async () => {
    await assertSucceeds(getDoc(doc(db('anyone'), roomPath)));
  });

  it('lets a creator stamp themselves as facilitator', async () => {
    await assertSucceeds(
      setDoc(doc(db('alice'), 'rooms/new1'), {
        facilitatorUid: 'alice',
        deck: { type: 'fib', values: FIB },
        currentRoundId: ROUND,
      }),
    );
  });

  it('rejects creating a room owned by someone else', async () => {
    await assertFails(
      setDoc(doc(db('alice'), 'rooms/new2'), {
        facilitatorUid: 'bob',
        deck: { type: 'fib', values: FIB },
        currentRoundId: ROUND,
      }),
    );
  });

  it('lets only the facilitator update room state', async () => {
    await assertSucceeds(updateDoc(doc(db('fac'), roomPath), { currentRoundId: 'r2' }));
    await assertFails(updateDoc(doc(db('mallory'), roomPath), { currentRoundId: 'r2' }));
  });

  it('forbids handing off facilitation', async () => {
    await assertFails(updateDoc(doc(db('fac'), roomPath), { facilitatorUid: 'mallory' }));
  });
});

describe('participants', () => {
  it('lets a user write only their own participant doc', async () => {
    await assertSucceeds(
      setDoc(doc(db('alice'), `${roomPath}/participants/alice`), {
        displayName: 'Alice',
        role: 'voter',
        hasVoted: false,
      }),
    );
    await assertFails(
      setDoc(doc(db('alice'), `${roomPath}/participants/bob`), {
        displayName: 'Not Bob',
        role: 'voter',
        hasVoted: false,
      }),
    );
  });
});

describe('rounds', () => {
  it('lets only the facilitator create/update rounds', async () => {
    await assertSucceeds(updateDoc(doc(db('fac'), roundPath), { status: 'revealed' }));
    await assertFails(updateDoc(doc(db('mallory'), roundPath), { status: 'revealed' }));
  });
});

describe('votes — writing', () => {
  it('lets a voter cast their own in-deck vote while voting is open', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), votePath('alice')), { value: '5' }));
  });

  it('rejects a value not in the deck', async () => {
    await assertFails(setDoc(doc(db('alice'), votePath('alice')), { value: '7' }));
  });

  it("rejects writing another player's vote", async () => {
    await assertFails(setDoc(doc(db('alice'), votePath('bob')), { value: '5' }));
  });

  it('rejects votes once the round is revealed', async () => {
    await revealRound();
    await assertFails(setDoc(doc(db('alice'), votePath('alice')), { value: '5' }));
  });
});

describe('votes — hidden until reveal', () => {
  it('lets a voter read their own vote during voting', async () => {
    await seedVote('alice', '5');
    await assertSucceeds(getDoc(doc(db('alice'), votePath('alice'))));
  });

  it("hides another player's vote during voting", async () => {
    await seedVote('bob', '8');
    await assertFails(getDoc(doc(db('alice'), votePath('bob'))));
  });

  it("reveals everyone's votes once the round is revealed", async () => {
    await seedVote('bob', '8');
    await revealRound();
    await assertSucceeds(getDoc(doc(db('alice'), votePath('bob'))));
  });

  it('lets the facilitator read all votes during voting (to aggregate at reveal)', async () => {
    await seedVote('bob', '8');
    await assertSucceeds(getDoc(doc(db('fac'), votePath('bob'))));
  });
});
