import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotingRoomComponent } from './voting-room/voting-room.component';
import { SharedModule } from '../shared/shared.module';
import { BasePageComponent } from './base-page/base-page.component';

@NgModule({
  declarations: [VotingRoomComponent, BasePageComponent],
  imports: [CommonModule, SharedModule],
  exports: [VotingRoomComponent],
})
export class PageModule {}
