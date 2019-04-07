import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { CardGroupComponent } from './card-group/card-group.component';
import { CardComponent } from './card/card.component';
import { ButtonComponent } from './button/button.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [NavBarComponent, CardGroupComponent, CardComponent, ButtonComponent, FooterComponent],
  imports: [CommonModule],
  exports: [NavBarComponent, CardGroupComponent, CardComponent, ButtonComponent, FooterComponent],
})
export class SharedModule {}
