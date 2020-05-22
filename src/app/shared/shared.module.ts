import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NavBarComponent } from "./nav-bar/nav-bar.component";
import { CardGroupComponent } from "./card-group/card-group.component";
import { CardComponent } from "./card/card.component";
import { ButtonComponent } from "./button/button.component";
import { FooterComponent } from "./footer/footer.component";
import { FooterColumnComponent } from "./footer/footer-column/footer-column.component";
import { PanelComponent } from "./panel/panel.component";

@NgModule({
  declarations: [
    NavBarComponent,
    CardGroupComponent,
    CardComponent,
    ButtonComponent,
    FooterComponent,
    FooterColumnComponent,
    PanelComponent,
  ],
  imports: [CommonModule],
  exports: [
    NavBarComponent,
    CardGroupComponent,
    CardComponent,
    ButtonComponent,
    FooterComponent,
    PanelComponent,
  ],
})
export class SharedModule {}
