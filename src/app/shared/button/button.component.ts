import { Component, OnInit, Input } from "@angular/core";
import { Button } from "../models/button/button.model";

@Component({
  selector: "scrum-est-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.scss"],
})
export class ButtonComponent implements OnInit {
  @Input()
  public buttonModel: Button = new Button();

  constructor() {}

  ngOnInit() {}
}
