// Production config. Replace the REPLACE_ME values with the real Firebase web app
// config from the console (operator prereq) before deploying. These values are
// public (client config), not secrets.
export const environment = {
  production: true,
  useEmulators: false,
  firebase: {
    apiKey: 'REPLACE_ME',
    authDomain: 'scrumestimator.firebaseapp.com',
    projectId: 'scrumestimator',
    storageBucket: 'scrumestimator.appspot.com',
    messagingSenderId: 'REPLACE_ME',
    appId: 'REPLACE_ME',
  },
};
