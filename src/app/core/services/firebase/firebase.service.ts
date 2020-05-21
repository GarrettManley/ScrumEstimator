import { Injectable } from "@angular/core";
import * as firebase from "firebase";
import App = firebase.app.App;
import Database = firebase.firestore.Firestore;

@Injectable({
  providedIn: "root",
})
export class FirebaseService {
  App: App;

  constructor() {
    this.initializeFirebaseApp();
  }

  private initializeFirebaseApp() {
    // TODO:: Move to separate config file
    const config = {
      authDomain: "scrumestimator.firebaseapp.com",
      databaseURL: "https://scrumestimator.firebaseio.com",
      projectId: "scrumestimator",
    };

    this.App = firebase.initializeApp(config);
  }

  public GetDB(): Database {
    return this.App.firestore();
  }
}
