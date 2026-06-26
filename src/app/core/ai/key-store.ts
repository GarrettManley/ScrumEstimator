import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'scrum-estimator:anthropic-key';

/**
 * Holds the user's bring-your-own Anthropic key. In memory by default; only
 * persisted to localStorage when the user explicitly opts to "remember on this
 * device". The key never leaves the browser except in calls to Anthropic.
 */
@Injectable({ providedIn: 'root' })
export class AiKeyStore {
  private readonly _key = signal<string | null>(this.load());
  readonly key = this._key.asReadonly();
  readonly hasKey = computed(() => !!this._key());

  setKey(key: string, remember: boolean): void {
    const trimmed = key.trim();
    this._key.set(trimmed || null);
    if (remember && trimmed) {
      this.persist(trimmed);
    } else {
      this.forget();
    }
  }

  clear(): void {
    this._key.set(null);
    this.forget();
  }

  private persist(key: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      // Storage may be unavailable; key remains in memory only.
    }
  }

  private forget(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  private load(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
