import { Timestamp } from 'firebase/firestore';
import { Deck } from '../domain/deck';
import { RoundResults } from '../domain/consensus';

export type RoundStatus = 'voting' | 'revealed';
export type ParticipantRole = 'voter' | 'spectator';

export interface Story {
  title: string;
  description: string;
}

/** `/rooms/{roomId}` */
export interface Room {
  createdAt: Timestamp;
  facilitatorUid: string;
  deck: Deck;
  currentRoundId: string;
}

/**
 * `/rooms/{roomId}/participants/{uid}`
 * `votedRoundId` records which round the player last voted in, so "has voted this
 * round" is `votedRoundId === room.currentRoundId` — no cross-user reset on a new round.
 */
export interface Participant {
  displayName: string;
  role: ParticipantRole;
  joinedAt: Timestamp;
  lastSeen: Timestamp;
  votedRoundId?: string;
}

/** `/rooms/{roomId}/rounds/{roundId}` — status is authoritative here, not on the room. */
export interface Round {
  createdAt: Timestamp;
  story: Story;
  deck: Deck;
  status: RoundStatus;
  revealedAt?: Timestamp;
  finalEstimate?: string;
  /** Advisory, facilitator-requested AI estimate (never auto-cast). */
  aiSuggestion?: { points: string; rationale: string };
  /** Aggregated by the facilitator at reveal, so other clients never list raw votes. */
  results?: RoundResults;
}

/** `/rooms/{roomId}/rounds/{roundId}/votes/{uid}` */
export interface Vote {
  value: string;
}
