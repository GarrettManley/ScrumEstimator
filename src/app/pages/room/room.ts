import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ParticipantView, RoomStore } from '../../core/room/room-store';
import { Round } from '../../core/room/models';
import { roundsToCsv } from '../../core/room/csv';
import { DeckType, presetDeck } from '../../core/domain/deck';
import { AiKeyStore } from '../../core/ai/key-store';
import { AiError, suggestEstimate } from '../../core/ai/claude';

@Component({
  selector: 'app-room',
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './room.html',
  styleUrl: './room.scss',
})
export class Room {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(RoomStore);
  readonly keys = inject(AiKeyStore);

  readonly roomId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly needsJoin = signal(this.store.room()?.id !== this.roomId);
  readonly joinName = signal('');
  readonly joining = signal(false);
  readonly copied = signal(false);

  // Facilitator story editing (seeded once per round so snapshots don't clobber typing).
  readonly storyTitle = signal('');
  readonly storyDesc = signal('');
  private seededRoundId: string | undefined;

  // AI key entry + request state.
  readonly keyInput = signal('');
  readonly remember = signal(false);
  readonly suggesting = signal(false);
  readonly aiError = signal<string | null>(null);

  readonly shareUrl = computed(() => `${location.origin}/room/${this.roomId}`);

  /** [value, count] pairs for the revealed distribution. */
  readonly distribution = computed(() => {
    const results = this.store.round()?.results;
    return results ? Object.entries(results.distribution) : [];
  });

  // Timer: a 1s ticker drives the countdown.
  readonly now = signal(Date.now());
  readonly remaining = computed(() => {
    const ends = this.store.round()?.timerEndsAt?.toMillis?.();
    if (ends === undefined) {
      return null;
    }
    return Math.max(0, Math.ceil((ends - this.now()) / 1000));
  });
  readonly maxCount = computed(() => {
    const counts = this.distribution().map(([, count]) => count);
    return counts.length ? Math.max(...counts) : 0;
  });

  constructor() {
    effect(() => {
      const round = this.store.round();
      if (round && round.id !== this.seededRoundId) {
        this.seededRoundId = round.id;
        this.storyTitle.set(round.story?.title ?? '');
        this.storyDesc.set(round.story?.description ?? '');
        this.aiError.set(null);
      }
    });

    const ticker = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(ticker));
  }

  async join(): Promise<void> {
    const name = this.joinName().trim();
    if (!name || this.joining()) {
      return;
    }
    this.joining.set(true);
    try {
      await this.store.joinRoom(this.roomId, name);
      if (!this.store.roomNotFound()) {
        this.needsJoin.set(false);
      }
    } finally {
      this.joining.set(false);
    }
  }

  vote(value: string): void {
    void this.store.castVote(value);
  }

  reveal(): void {
    void this.store.reveal();
  }

  reset(): void {
    void this.store.reset();
  }

  saveStory(): void {
    void this.store.setStory({
      title: this.storyTitle().trim(),
      description: this.storyDesc().trim(),
    });
  }

  saveKey(): void {
    this.keys.setKey(this.keyInput(), this.remember());
    this.keyInput.set('');
  }

  async suggest(): Promise<void> {
    const apiKey = this.keys.key();
    const round = this.store.round();
    if (!apiKey || !round || this.suggesting()) {
      return;
    }
    this.suggesting.set(true);
    this.aiError.set(null);
    try {
      const suggestion = await suggestEstimate({ apiKey, story: round.story, deck: this.store.deck() });
      await this.store.applyAiSuggestion(suggestion);
    } catch (e) {
      this.aiError.set(e instanceof AiError ? e.message : 'AI request failed.');
    } finally {
      this.suggesting.set(false);
    }
  }

  isMe(p: ParticipantView): boolean {
    return p.uid === this.store.uid();
  }

  startTimer(seconds: number): void {
    void this.store.startTimer(seconds);
  }

  toggleSpectator(): void {
    void this.store.setRole(this.store.isSpectator() ? 'voter' : 'spectator');
  }

  switchDeck(type: string): void {
    if (type === 'fib' || type === 'pow2' || type === 'tshirt') {
      void this.store.changeDeck(presetDeck(type as Exclude<DeckType, 'custom'>));
    }
  }

  barWidth(count: number): string {
    const max = this.maxCount();
    return max ? `${(count / max) * 100}%` : '0%';
  }

  exportCsv(): void {
    const current = this.store.round();
    const rounds = current?.results ? [current, ...this.store.history()] : this.store.history();
    if (!rounds.length) {
      return;
    }
    const blob = new Blob([roundsToCsv(rounds)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scrum-estimator-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  /** One-line outcome summary for a past round in the history list. */
  outcome(r: Round): string {
    const res = r.results;
    if (!res) {
      return '—';
    }
    if (res.consensus) {
      return `${res.mode[0]} · consensus`;
    }
    if (res.mean !== undefined) {
      return `avg ${res.mean.toFixed(1)}`;
    }
    return res.mode.join(' / ') || '—';
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.shareUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); ignore.
    }
  }
}
