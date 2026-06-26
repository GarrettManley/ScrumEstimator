import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ParticipantView, RoomStore } from '../../core/room/room-store';

@Component({
  selector: 'app-room',
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './room.html',
  styleUrl: './room.scss',
})
export class Room {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(RoomStore);

  readonly roomId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly needsJoin = signal(this.store.room()?.id !== this.roomId);
  readonly joinName = signal('');
  readonly joining = signal(false);
  readonly copied = signal(false);

  readonly shareUrl = computed(() => `${location.origin}/room/${this.roomId}`);

  /** [value, count] pairs for the revealed distribution. */
  readonly distribution = computed(() => {
    const results = this.store.round()?.results;
    return results ? Object.entries(results.distribution) : [];
  });

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

  isMe(p: ParticipantView): boolean {
    return p.uid === this.store.uid();
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
