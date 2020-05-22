import { Component, OnInit } from "@angular/core";
import { Button } from "src/app/shared/models/button/button.model";
import { VotingRoomService } from "src/app/core/services/app/voting-room.service";

@Component({
  selector: "scrum-est-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  createNewRoomButton: Button = new Button("Create New Voting Room");
  gettingStarted: boolean = true;

  constructor(private _votingRoomService: VotingRoomService) {}

  ngOnInit(): void {}

  createNewRoom() {
    this.gettingStarted = false;
    // TODO:: Handle errors in createNewRoom request
    this._votingRoomService.createNewRoom();
  }
}
