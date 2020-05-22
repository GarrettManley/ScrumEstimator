import { Component } from "@angular/core";
import { Card } from "./shared/models/card/card.model";
import { CardTypes } from "./shared/models/card/card-types.enum";
import { SelectableGroup } from "./shared/models/base/base.selectable-group.model";

@Component({
  selector: "scrum-est-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "ScrumEstimator";

  constructor() {}
}
