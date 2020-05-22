import { Component, OnInit, Input } from "@angular/core";
import { Card } from "../models/card/card.model";

@Component({
  selector: "scrum-est-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
})
export class CardComponent implements OnInit {
  @Input()
  public cardModel: Card = new Card();

  constructor() {}

  ngOnInit() {}
}
