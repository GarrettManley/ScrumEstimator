import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomStore } from '../../core/room/room-store';

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
  readonly creating = signal(false);

  async create(): Promise<void> {
    const name = this.name().trim();
    if (!name || this.creating()) {
      return;
    }
    this.creating.set(true);
    try {
      const roomId = await this.store.createRoom(name);
      await this.router.navigate(['/room', roomId]);
    } finally {
      this.creating.set(false);
    }
  }
}
