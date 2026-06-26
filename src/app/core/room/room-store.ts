import { Injectable, computed, signal } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { auth, db } from '../firebase/firebase';
import { computeResults } from '../domain/consensus';
import { Deck, presetDeck } from '../domain/deck';
import { Participant, ParticipantRole, Room, Round, RoundStatus, Story, Vote } from './models';
import { AiSuggestion } from '../ai/claude';

type WithId<T> = T & { id: string };
export type ParticipantView = Participant & { uid: string };

const HEARTBEAT_MS = 15_000;
const AWAY_MS = 40_000;

/**
 * Single source of truth for a live planning-poker room. Mirrors Firestore into
 * signals: room, roster, current round, and the caller's own vote. During voting
 * only the caller's own vote is subscribed (others are hidden by rules); at reveal
 * the facilitator aggregates all votes into `round.results`, which every client reads.
 */
@Injectable({ providedIn: 'root' })
export class RoomStore {
  private readonly _uid = signal<string | null>(auth.currentUser?.uid ?? null);
  readonly uid = this._uid.asReadonly();

  readonly room = signal<WithId<Room> | null>(null);
  readonly roomNotFound = signal(false);
  readonly participants = signal<ParticipantView[]>([]);
  readonly round = signal<WithId<Round> | null>(null);
  readonly ownVote = signal<string | null>(null);
  readonly rounds = signal<WithId<Round>[]>([]);

  /** Revealed rounds other than the current one, newest first — the in-session history. */
  readonly history = computed(() => {
    const currentId = this.room()?.currentRoundId;
    return this.rounds()
      .filter((r) => r.status === 'revealed' && r.results && r.id !== currentId)
      .reverse();
  });

  readonly isFacilitator = computed(() => {
    const r = this.room();
    return !!r && r.facilitatorUid === this._uid();
  });
  readonly status = computed<RoundStatus>(() => this.round()?.status ?? 'voting');
  readonly revealed = computed(() => this.status() === 'revealed');
  readonly deck = computed(() => this.round()?.deck ?? this.room()?.deck ?? presetDeck('fib'));

  readonly myRole = computed<ParticipantRole>(() => {
    const uid = this._uid();
    return this.participants().find((p) => p.uid === uid)?.role ?? 'voter';
  });
  readonly isSpectator = computed(() => this.myRole() === 'spectator');

  private roomSubs: Unsubscribe[] = [];
  private roundSubs: Unsubscribe[] = [];
  private heartbeatTimer: ReturnType<typeof setInterval> | undefined;
  private watchedRoundId: string | undefined;

  setUid(uid: string): void {
    this._uid.set(uid);
  }

  /** True when the given participant has voted in the room's current round. */
  hasVotedThisRound(p: ParticipantView): boolean {
    return !!p.votedRoundId && p.votedRoundId === this.room()?.currentRoundId;
  }

  /** Render-only presence: a participant whose heartbeat has gone stale shows as away. */
  isAway(p: ParticipantView): boolean {
    const last = p.lastSeen?.toMillis?.();
    return last !== undefined && Date.now() - last > AWAY_MS;
  }

  private requireUid(): string {
    const uid = this._uid();
    if (!uid) {
      throw new Error('Not signed in');
    }
    return uid;
  }

  /** Create a room, become its facilitator, open the first round, and start watching. */
  async createRoom(displayName: string, deck: Deck = presetDeck('fib')): Promise<string> {
    const uid = this.requireUid();
    const roomId = nanoid(8);
    const roundId = nanoid(10);

    await setDoc(doc(db, 'rooms', roomId), {
      createdAt: serverTimestamp(),
      facilitatorUid: uid,
      deck,
      currentRoundId: roundId,
    });
    await setDoc(doc(db, 'rooms', roomId, 'rounds', roundId), {
      createdAt: serverTimestamp(),
      story: { title: '', description: '' },
      deck,
      status: 'voting',
    });
    await this.upsertSelf(roomId, displayName, 'voter');
    this.watch(roomId);
    return roomId;
  }

  /** Join an existing room, or flag not-found if the id is unknown. */
  async joinRoom(
    roomId: string,
    displayName: string,
    role: ParticipantRole = 'voter',
  ): Promise<void> {
    const snap = await getDoc(doc(db, 'rooms', roomId));
    if (!snap.exists()) {
      this.roomNotFound.set(true);
      return;
    }
    await this.upsertSelf(roomId, displayName, role);
    this.watch(roomId);
  }

  private async upsertSelf(
    roomId: string,
    displayName: string,
    role: ParticipantRole,
  ): Promise<void> {
    const uid = this.requireUid();
    await setDoc(
      doc(db, 'rooms', roomId, 'participants', uid),
      { displayName, role, joinedAt: serverTimestamp(), lastSeen: serverTimestamp() },
      { merge: true },
    );
  }

  /** Cast (or change) the caller's vote and mark them as having voted this round. */
  async castVote(value: string): Promise<void> {
    const uid = this.requireUid();
    const room = this.room();
    const round = this.round();
    if (!room || !round || round.status !== 'voting') {
      return;
    }
    await setDoc(doc(db, 'rooms', room.id, 'rounds', round.id, 'votes', uid), { value });
    await updateDoc(doc(db, 'rooms', room.id, 'participants', uid), {
      votedRoundId: round.id,
      lastSeen: serverTimestamp(),
    });
  }

  /** Facilitator only: read all votes, aggregate, and reveal. */
  async reveal(): Promise<void> {
    const room = this.room();
    const round = this.round();
    if (!room || !round || !this.isFacilitator()) {
      return;
    }
    const votesSnap = await getDocs(collection(db, 'rooms', room.id, 'rounds', round.id, 'votes'));
    const votes = votesSnap.docs.map((d) => (d.data() as Vote).value);
    const results = computeResults(votes, round.deck);
    await updateDoc(doc(db, 'rooms', room.id, 'rounds', round.id), {
      status: 'revealed',
      revealedAt: serverTimestamp(),
      results,
    });
  }

  /** Facilitator only: open a fresh round (same deck + story) and make it current. */
  async reset(): Promise<void> {
    const room = this.room();
    const round = this.round();
    if (!room || !round || !this.isFacilitator()) {
      return;
    }
    const newRoundId = nanoid(10);
    await setDoc(doc(db, 'rooms', room.id, 'rounds', newRoundId), {
      createdAt: serverTimestamp(),
      story: round.story,
      deck: room.deck,
      status: 'voting',
    });
    await updateDoc(doc(db, 'rooms', room.id), { currentRoundId: newRoundId });
  }

  /** Facilitator only: set the current round's story. */
  async setStory(story: Story): Promise<void> {
    const room = this.room();
    const round = this.round();
    if (!room || !round || !this.isFacilitator()) {
      return;
    }
    await updateDoc(doc(db, 'rooms', room.id, 'rounds', round.id), { story });
  }

  /** Facilitator only: attach an advisory AI suggestion to the current round. */
  async applyAiSuggestion(suggestion: AiSuggestion): Promise<void> {
    const room = this.room();
    const round = this.round();
    if (!room || !round || !this.isFacilitator()) {
      return;
    }
    await updateDoc(doc(db, 'rooms', room.id, 'rounds', round.id), { aiSuggestion: suggestion });
  }

  /** Switch the caller between voter and spectator. */
  async setRole(role: ParticipantRole): Promise<void> {
    const room = this.room();
    const uid = this._uid();
    if (!room || !uid) {
      return;
    }
    await updateDoc(doc(db, 'rooms', room.id, 'participants', uid), { role });
  }

  /** Facilitator only: switch decks by opening a fresh round (never invalidates cast votes). */
  async changeDeck(deck: Deck): Promise<void> {
    const room = this.room();
    if (!room || !this.isFacilitator()) {
      return;
    }
    const newRoundId = nanoid(10);
    await setDoc(doc(db, 'rooms', room.id, 'rounds', newRoundId), {
      createdAt: serverTimestamp(),
      story: this.round()?.story ?? { title: '', description: '' },
      deck,
      status: 'voting',
    });
    await updateDoc(doc(db, 'rooms', room.id), { currentRoundId: newRoundId, deck });
  }

  /** Facilitator only: start a countdown of `seconds` on the current round. */
  async startTimer(seconds: number): Promise<void> {
    const room = this.room();
    const round = this.round();
    if (!room || !round || !this.isFacilitator()) {
      return;
    }
    await updateDoc(doc(db, 'rooms', room.id, 'rounds', round.id), {
      timerEndsAt: Timestamp.fromMillis(Date.now() + seconds * 1000),
    });
  }

  /** Stop all subscriptions (e.g. when leaving a room). */
  leave(): void {
    this.teardown();
    this.room.set(null);
    this.participants.set([]);
    this.round.set(null);
    this.ownVote.set(null);
    this.rounds.set([]);
    this.roomNotFound.set(false);
    this.watchedRoundId = undefined;
  }

  private watch(roomId: string): void {
    this.teardown();
    this.roomNotFound.set(false);

    this.roomSubs.push(
      onSnapshot(doc(db, 'rooms', roomId), (snap) => {
        if (!snap.exists()) {
          this.room.set(null);
          this.roomNotFound.set(true);
          return;
        }
        const data = snap.data() as Room;
        this.room.set({ id: snap.id, ...data });
        if (data.currentRoundId !== this.watchedRoundId) {
          this.watchRound(roomId, data.currentRoundId);
        }
      }),
    );

    this.roomSubs.push(
      onSnapshot(collection(db, 'rooms', roomId, 'participants'), (snap) => {
        this.participants.set(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Participant) })));
      }),
    );

    this.roomSubs.push(
      onSnapshot(
        query(collection(db, 'rooms', roomId, 'rounds'), orderBy('createdAt', 'asc')),
        (snap) => {
          this.rounds.set(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Round) })));
        },
      ),
    );

    this.startHeartbeat(roomId);
  }

  private watchRound(roomId: string, roundId: string): void {
    this.watchedRoundId = roundId;
    this.roundSubs.forEach((u) => u());
    this.roundSubs = [];
    this.ownVote.set(null);

    this.roundSubs.push(
      onSnapshot(doc(db, 'rooms', roomId, 'rounds', roundId), (snap) => {
        this.round.set(snap.exists() ? { id: snap.id, ...(snap.data() as Round) } : null);
      }),
    );

    const uid = this._uid();
    if (uid) {
      this.roundSubs.push(
        onSnapshot(doc(db, 'rooms', roomId, 'rounds', roundId, 'votes', uid), (snap) => {
          this.ownVote.set(snap.exists() ? (snap.data() as Vote).value : null);
        }),
      );
    }
  }

  private startHeartbeat(roomId: string): void {
    this.stopHeartbeat();
    const uid = this._uid();
    if (!uid) {
      return;
    }
    this.heartbeatTimer = setInterval(() => {
      void updateDoc(doc(db, 'rooms', roomId, 'participants', uid), {
        lastSeen: serverTimestamp(),
      }).catch(() => undefined);
    }, HEARTBEAT_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private teardown(): void {
    this.roomSubs.forEach((u) => u());
    this.roomSubs = [];
    this.roundSubs.forEach((u) => u());
    this.roundSubs = [];
    this.stopHeartbeat();
  }
}
