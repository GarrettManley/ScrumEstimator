import { Injectable } from "@angular/core";
import { FirebaseService } from "../firebase/firebase.service";
import * as firebase from "firebase";
import Database = firebase.firestore.Firestore;

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  Database: Database;

  constructor(private _firebaseService: FirebaseService) {
    this.Database = _firebaseService.GetDB();
  }

  GetCollection(path: string) {
    return this.Database.collection(path).get();
  }
}
