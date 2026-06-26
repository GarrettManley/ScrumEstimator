/**
 * Firebase web app config. These values are public (not secrets) — the client
 * config is meant to ship in the browser. Real values come from the Firebase
 * console at deploy (operator prereq 2). In dev the emulators are used, so the
 * placeholders below are sufficient for local work.
 */
export const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'scrumestimator.firebaseapp.com',
  // `demo-` keeps dev/emulator self-contained; M5 swaps in the real project id.
  projectId: 'demo-scrumestimator',
  storageBucket: 'scrumestimator.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:0000000000000000000000',
};
