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

  async getCollection(path: string) {
    return await this.Database.collection(path).get();
  }

  async createNewDocument(path: string) {
    const doc = await this.Database.collection(path).add({});
    return doc.id;
  }
}
