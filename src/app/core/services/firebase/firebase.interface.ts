import * as firebase from "firebase";
import App = firebase.app.App;
import Database = firebase.firestore.Firestore;

export interface IFirebaseService {
  App: App;
  GetDB(): Database;
}
