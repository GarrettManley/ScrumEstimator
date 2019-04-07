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
  // voting cards
  votingCardGroup: SelectableGroup;
  votingCards: Card[] = [
    new Card('0', CardTypes.display),
    new Card('1', CardTypes.interactive),
    new Card('2', CardTypes.interactive),
    new Card('3', CardTypes.interactive),
    new Card('5', CardTypes.interactive),
    new Card('8', CardTypes.interactive),
    new Card('13', CardTypes.interactive),
    new Card('?', CardTypes.interactive),
  ];

  ngOnInit() {
    const votingCardGroupTitle = 'Vote for a story point estimate';
    this.votingCardGroup = new SelectableGroup(this.votingCards, votingCardGroupTitle);
  }
}
