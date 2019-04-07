import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/shared/models/card/card.model';
import { SelectableGroup } from 'src/app/shared/models/base/base.selectable-group.model';
import { CardTypes } from 'src/app/shared/models/card/card-types.enum';

@Component({
  selector: 'scrum-est-voting-room',
  templateUrl: './voting-room.component.html',
  styleUrls: ['./voting-room.component.scss'],
})
export class VotingRoomComponent implements OnInit {
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

  ngOnInit() {}
}
