import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ParticipantView, RoomStore } from '../../core/room/room-store';
import { Round } from '../../core/room/models';
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
