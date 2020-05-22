import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { VotingRoomComponent } from "./page/voting-room/voting-room.component";
import { HomeComponent } from "./page/home/home.component";

const routes: Routes = [
  { path: "voting-room", component: VotingRoomComponent },
  { path: "home", component: HomeComponent },
  { path: "", redirectTo: "/home", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
