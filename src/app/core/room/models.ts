import { Timestamp } from 'firebase/firestore';
import { Deck } from '../domain/deck';

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

/** `/rooms/{roomId}/participants/{uid}` */
export interface Participant {
  displayName: string;
  role: ParticipantRole;
  joinedAt: Timestamp;
  lastSeen: Timestamp;
  hasVoted: boolean;
}

/** `/rooms/{roomId}/rounds/{roundId}` — status is authoritative here, not on the room. */
export interface Round {
  story: Story;
  deck: Deck;
  status: RoundStatus;
  revealedAt?: Timestamp;
  finalEstimate?: string;
  /** Aggregated by the facilitator at reveal (so other clients never list raw votes). */
  results?: Record<string, number>;
  average?: number;
}

/** `/rooms/{roomId}/rounds/{roundId}/votes/{uid}` */
export interface Vote {
  value: string;
}
