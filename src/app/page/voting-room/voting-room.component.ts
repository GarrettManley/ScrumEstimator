import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/shared/models/card/card.model';
import { SelectableGroup } from 'src/app/shared/models/base/base.selectable-group.model';
import { CardTypes } from 'src/app/shared/models/card/card-types.enum';
import { Button } from 'src/app/shared/models/button/button.model';

@Component({
  selector: 'scrum-est-voting-room',
  templateUrl: './voting-room.component.html',
  styleUrls: ['./voting-room.component.scss'],
})
export class VotingRoomComponent implements OnInit {
  // voting group
  votingGroup: SelectableGroup;
  votingGroups: Button[] = [new Button('Developers'), new Button('QA'), new Button('Designers')];
  // voting cards
  votingCardGroup: SelectableGroup;
  votingCards: Card[] = [
    new Card('0', CardTypes.interactive),
    new Card('1', CardTypes.interactive),
    new Card('2', CardTypes.interactive),
    new Card('3', CardTypes.interactive),
    new Card('5', CardTypes.interactive),
    new Card('8', CardTypes.interactive),
    new Card('13', CardTypes.interactive),
    new Card('?', CardTypes.interactive),
  ];

  ngOnInit() {
    this.setupVotingGroup();
    this.setupVotingCards();
  }

  setupVotingGroup() {
    const votingGroupTitle = 'Choose a voting group';
    this.votingGroup = new SelectableGroup(this.votingGroups, votingGroupTitle);
  }

  setupVotingCards() {
    const votingCardGroupTitle = 'Vote for a story point estimate';
    this.votingCardGroup = new SelectableGroup(this.votingCards, votingCardGroupTitle);
  }
}
