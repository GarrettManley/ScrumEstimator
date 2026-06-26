import { initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

const app = initializeApp(environment.firebase);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Dev builds talk to the local emulators; production talks to the real project.
if (environment.useEmulators) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}
