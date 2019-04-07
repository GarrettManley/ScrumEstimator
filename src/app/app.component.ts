import { Component } from '@angular/core';
import { Card } from './shared/models/card/card.model';
import { CardTypes } from './shared/models/card/card-types.enum';
import { SelectableGroup } from './shared/models/base/base.selectable-group.model';

@Component({
  selector: 'scrum-est-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ScrumEstimator';

  cardGroup: SelectableGroup;

  cards: Card[] = [
    new Card('0', CardTypes.display),
    new Card('1', CardTypes.interactive),
    new Card('2', CardTypes.interactive),
    new Card('3', CardTypes.interactive),
    new Card('5', CardTypes.interactive),
    new Card('8', CardTypes.interactive),
    new Card('13', CardTypes.interactive),
    new Card('?', CardTypes.interactive),
  ];

  constructor() {
    const title = 'Vote for a story point estimate';
    this.cardGroup = new SelectableGroup(this.cards, this.cards[1].id, title);
    this.cardGroup.active = true;
  }
}
