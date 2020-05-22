import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Card } from "src/app/shared/models/card/card.model";
import { SelectableGroup } from "src/app/shared/models/base/base.selectable-group.model";
import { CardTypes } from "src/app/shared/models/card/card-types.enum";
import { Button } from "src/app/shared/models/button/button.model";
import { VotingRoomService } from "src/app/core/services/app/voting-room.service";

@Component({
  selector: "scrum-est-voting-room",
  templateUrl: "./voting-room.component.html",
  styleUrls: ["./voting-room.component.scss"],
})
export class VotingRoomComponent implements OnInit, AfterViewInit {
  // voting group
  votingGroup: SelectableGroup;
  votingGroups: Button[] = [
    new Button("Developers"),
    new Button("QA"),
    new Button("Designers"),
  ];

  // voting cards
  votingCardGroup: SelectableGroup;
  votingCards: Card[] = [
    new Card("0", CardTypes.interactive),
    new Card("1", CardTypes.interactive),
    new Card("2", CardTypes.interactive),
    new Card("3", CardTypes.interactive),
    new Card("5", CardTypes.interactive),
    new Card("8", CardTypes.interactive),
    new Card("13", CardTypes.interactive),
    new Card("?", CardTypes.interactive),
  ];

  constructor(private _votingRoomService: VotingRoomService) {}

  ngOnInit() {
    this.setupVotingGroup();
    this.setupVotingCards();
  }

  async ngAfterViewInit() {
    await this._votingRoomService.setupVotingRoom();
  }

  setupVotingGroup() {
    const votingGroupTitle = "Choose a voting group";
    this.votingGroup = new SelectableGroup(this.votingGroups, votingGroupTitle);
  }

  setupVotingCards() {
    const votingCardGroupTitle = "Vote for a story point estimate";
    this.votingCardGroup = new SelectableGroup(
      this.votingCards,
      votingCardGroupTitle
    );
  }
}
