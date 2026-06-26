// Development config: a self-contained demo project, talking to the local emulators.
export const environment = {
  production: false,
  useEmulators: true,
  firebase: {
    apiKey: 'demo-api-key',
    authDomain: 'demo-scrumestimator.firebaseapp.com',
    projectId: 'demo-scrumestimator',
    storageBucket: 'demo-scrumestimator.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000000000',
  },
};
