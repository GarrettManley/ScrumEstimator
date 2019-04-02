import { Component, OnInit } from '@angular/core';
import { CardTypes } from '../models/card/card-types.enum';

@Component({
  selector: 'scrum-est-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  cardTypeInteractive: CardTypes = CardTypes.interactive;
  constructor() {}

  ngOnInit() {}
}
