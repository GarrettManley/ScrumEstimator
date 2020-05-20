import { Injectable } from "@angular/core";
import * as firebase from "firebase";

@Injectable({
  providedIn: "root",
})
export class FirebaseService {
  constructor() {
    this.initializeFirebaseApp();
  }

  private initializeFirebaseApp() {
    const config = {
      authDomain: "scrumestimator.firebaseapp.com",
      databaseURL: "https://scrumestimator.firebaseio.com",
    };
    firebase.initializeApp(config);
  }
}
