import { Component } from '@angular/core';
import { Card } from './shared/models/card/card.model';
import { CardTypes } from './shared/models/card/card-types.enum';

@Component({
  selector: 'scrum-est-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ScrumEstimator';

  cards: Card[] = [
    new Card('0', CardTypes.interactive),
    new Card('1', CardTypes.interactive),
    new Card('2', CardTypes.interactiveSelected),
    new Card('3', CardTypes.interactive),
    new Card('5', CardTypes.interactive),
    new Card('8', CardTypes.interactive),
    new Card('13', CardTypes.interactive),
    new Card('?', CardTypes.interactive),
  ];

  constructor() {}
}
