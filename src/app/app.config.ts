import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ensureSignedIn } from './core/auth/auth';
import { RoomStore } from './core/room/room-store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Every visitor gets an anonymous uid before the first route renders.
    provideAppInitializer(async () => {
      const store = inject(RoomStore);
      const user = await ensureSignedIn();
      store.setUid(user.uid);
    }),
  ],
};
