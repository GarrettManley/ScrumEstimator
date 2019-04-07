import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VotingRoomComponent } from './page/voting-room/voting-room.component';

const routes: Routes = [
  { path: 'voting-room', component: VotingRoomComponent },
  { path: '', redirectTo: '/voting-room', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
