import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DatabaseService } from "../database/database.service";

@Injectable({
  providedIn: "root",
})
export class VotingRoomService {
  votingRoomId: string;

  private votingRoomPath: string = "voting-room";
  private votingRooms: string[] = [];

  constructor(
    private _route: ActivatedRoute,
    private _database: DatabaseService
  ) {}

  async setupVotingRoom() {
    this.getRoomIdFromParams();
    if (!(await this.validateRoomId())) {
      await this.createNewRoom();
    }
  }

  private getRoomIdFromParams() {
    this._route.queryParamMap.subscribe((params) => {
      this.votingRoomId = params.get("id");
    });
  }

  private async validateRoomId(): Promise<boolean> {
    let valid = false;

    if (this.votingRoomId) {
      const rooms = await this.getAllVotingRoomIds();

      if (rooms.includes(this.votingRoomId)) {
        valid = true;
      }
    }

    return valid;
  }

  private async getAllVotingRoomIds() {
    await this._database
      .getCollection(this.votingRoomPath)
      .then((collection) => {
        collection.forEach((doc) => {
          this.votingRooms.push(doc.id);
        });
      });

    return this.votingRooms;
  }

  private async createNewRoom() {
    this.votingRoomId = await this._database.createNewDocument(
      this.votingRoomPath
    );

    console.log(`new voting room created: ${this.votingRoomId}`);
  }
}
