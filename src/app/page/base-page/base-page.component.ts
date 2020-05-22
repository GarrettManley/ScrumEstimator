import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "scrum-est-base-page",
  templateUrl: "./base-page.component.html",
  styleUrls: ["./base-page.component.scss"],
})
export class BasePageComponent implements OnInit {
  @Input()
  flex: boolean;

  @Input()
  center: boolean;

  constructor() {}

  ngOnInit() {}
}
