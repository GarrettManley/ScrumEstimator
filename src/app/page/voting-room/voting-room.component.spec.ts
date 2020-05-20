import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { VotingRoomComponent } from "./voting-room.component";

describe("VotingRoomComponent", () => {
  let component: VotingRoomComponent;
  let fixture: ComponentFixture<VotingRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VotingRoomComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VotingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
