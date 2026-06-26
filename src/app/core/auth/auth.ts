import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase/firebase';

/**
 * Resolve with the current user, signing in anonymously if needed. Used by the
 * app initializer so every visitor has a uid before the first route renders.
 */
export function ensureSignedIn(): Promise<User> {
  return new Promise<User>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        }
      },
      reject,
    );
    signInAnonymously(auth).catch(reject);
  });
}
