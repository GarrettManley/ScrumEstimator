import App = firebase.app.App;
import Database = firebase.database.Database;

export interface IFirebaseService {
  App: App;
  GetDB(): Database;
}
