import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "scrum-est-footer-column",
  templateUrl: "./footer-column.component.html",
  styleUrls: ["./footer-column.component.scss"],
})
export class FooterColumnComponent implements OnInit {
  @Input()
  header: string;

  constructor() {}

  ngOnInit(): void {}
}
