import { Component, OnInit, Input } from '@angular/core';
import { SelectableGroup } from '../models/base/base.selectable-group.model';

@Component({
  selector: 'scrum-est-card-group',
  templateUrl: './card-group.component.html',
  styleUrls: ['./card-group.component.scss'],
})
export class CardGroupComponent extends SelectableGroup implements OnInit {
  @Input()
  public cardGroup: SelectableGroup;

  constructor() {
    super();
  }

  ngOnInit() {
    this.title = this.cardGroup.title;
    this.group = this.cardGroup.group;
    this.selectedItem = this.cardGroup.selectedItem;
  }
}
