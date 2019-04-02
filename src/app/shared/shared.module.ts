import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { CardGroupComponent } from './card-group/card-group.component';
import { CardComponent } from './card/card.component';

@NgModule({
  declarations: [NavBarComponent, CardGroupComponent, CardComponent],
  imports: [CommonModule],
  exports: [NavBarComponent, CardGroupComponent, CardComponent],
})
export class SharedModule {}
