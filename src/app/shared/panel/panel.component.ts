import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "scrum-est-panel",
  templateUrl: "./panel.component.html",
  styleUrls: ["./panel.component.scss"],
})
export class PanelComponent implements OnInit {
  @Input()
  title: string;

  @Input()
  active: boolean;

  constructor() {}

  ngOnInit(): void {}
}
