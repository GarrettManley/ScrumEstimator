import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'scrum-est-card-group',
  templateUrl: './card-group.component.html',
  styleUrls: ['./card-group.component.scss'],
})
export class CardGroupComponent implements OnInit {
  @Input()
  public title: string;

  constructor() {}

  ngOnInit() {}
}
