# ScrumEstimator

Real-time **planning poker** for agile teams. Create a room, share the link, vote on a
story, and reveal — with optional, bring-your-own-key **AI estimate suggestions**.

Originally started in 2020 (Angular 9) and left unfinished; rebuilt in 2026 on a modern
stack and completed.

## Features

- **Frictionless rooms** — create a room, share a link; no sign-up. Anonymous auth under
  the hood.
- **Hidden voting → reveal** — votes stay hidden until the facilitator reveals, then the
  distribution, mean/mode, and consensus are shown. Enforced in Firestore security rules,
  not just the UI.
- **Live presence** — see who's in the room and who has voted, in real time.
- **AI estimation (BYO key)** — the facilitator can ask Claude to suggest a point value
  from the story text. Advisory only; never auto-cast.
- **Round history** and **CSV export**.
- **Spectator mode**, a per-round **timer**, a **distribution chart**, and **custom decks**
  (Fibonacci / powers-of-2 / T-shirt / your own values).

## Stack

Angular 22 (standalone, signals, zoneless) · Firebase (Firestore + Anonymous Auth +
Hosting) via the modular Web SDK · Vitest (unit) · Playwright (e2e) ·
`@firebase/rules-unit-testing` (security-rules tests) · ESLint.

## Develop

Prerequisites: **Node 24+** and a **JDK 21+** (the Firebase emulators require Java).

```bash
npm install
npm start            # ng serve → http://localhost:4200 (talks to the emulators)
npm run emulators    # Firestore + Auth emulators (run in another terminal)
```

In development the app targets a self-contained demo project on the local emulators, so no
real Firebase credentials are needed.

## Test

```bash
npm run lint
npm run test:ci      # Vitest unit tests
npm run test:rules   # Firestore security-rules tests (in the emulator)
npm run e2e          # Playwright e2e (wraps the emulators) — incl. an axe a11y pass
```

The e2e suite drives two browser contexts through a full join → vote → reveal → new-round
flow and doubles as a scripted multi-client demo of the realtime loop.

## AI estimation — how the BYO key works

The "Suggest estimate" feature calls the Anthropic API **directly from the browser** using
the facilitator's own API key (`anthropic-dangerous-direct-browser-access`). This is a
deliberate design choice, not an oversight:

- There is **no server and no shared key** — each user brings their own, so the project has
  zero AI cost and no abuse surface tied to the owner.
- The key is held **in memory by default**; "remember on this device" persists it to
  `localStorage` only if you opt in. It is **never written to Firestore or any server we
  run** — it goes only to Anthropic.
- A strict Content-Security-Policy (see `firebase.json`) limits where the page can send
  data, reducing the exfiltration surface for a stored key.
- **Privacy note:** when you use AI estimation, the round's story title/description is sent
  to Anthropic to produce a suggestion.

## Deploy

Production builds swap in `src/environments/environment.prod.ts` (fill in the real Firebase
web config there) and talk to the live project. CI (`.github/workflows/ci.yml`) runs
lint/unit/rules/e2e on every push; the opt-in deploy job (set repo variable
`DEPLOY_ENABLED=true`, plus `FIREBASE_PROJECT_ID` and a `FIREBASE_SERVICE_ACCOUNT` secret)
deploys Firestore rules + indexes and then Hosting on pushes to `master`.

```bash
npm run build                                   # production bundle
npx firebase deploy --only firestore:rules,firestore:indexes
npx firebase deploy --only hosting
```
