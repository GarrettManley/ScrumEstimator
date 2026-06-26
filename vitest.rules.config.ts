import { defineConfig } from 'vitest/config';

// Standalone config for Firestore security-rules tests. These run in Node against
// the Firestore emulator (via `firebase emulators:exec`), separate from the
// Angular component/unit tests under src/.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    testTimeout: 15_000,
    hookTimeout: 30_000,
  },
});
