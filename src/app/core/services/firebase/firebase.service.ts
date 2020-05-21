import { Injectable } from "@angular/core";
import * as firebase from "firebase";
import { IFirebaseService } from "./firebase.interface";
import App = firebase.app.App;
import Database = firebase.database.Database;

@Injectable({
  providedIn: "root",
})
export class FirebaseService implements IFirebaseService {
  App: App;

  constructor() {
    this.initializeFirebaseApp();
  }

  private initializeFirebaseApp() {
    // TODO:: Move to separate config file
    const config = {
      authDomain: "scrumestimator.firebaseapp.com",
      databaseURL: "https://scrumestimator.firebaseio.com",
    };

    this.App = firebase.initializeApp(config);
  }

  public GetDB(): Database {
    return this.App.database();
  }
}
