import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomStore } from '../../core/room/room-store';
import { Deck, DeckType, customDeck, presetDeck } from '../../core/domain/deck';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly store = inject(RoomStore);
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly deckType = signal<DeckType>('fib');
  readonly customValues = signal('');
  readonly creating = signal(false);

  private buildDeck(): Deck {
    if (this.deckType() === 'custom') {
      const deck = customDeck(this.customValues().split(','));
      return deck.values.length >= 2 ? deck : presetDeck('fib');
    }
    return presetDeck(this.deckType() as Exclude<DeckType, 'custom'>);
  }

  async create(): Promise<void> {
    const name = this.name().trim();
    if (!name || this.creating()) {
      return;
    }
    this.creating.set(true);
    try {
      const roomId = await this.store.createRoom(name, this.buildDeck());
      await this.router.navigate(['/room', roomId]);
    } finally {
      this.creating.set(false);
    }
  }
}
