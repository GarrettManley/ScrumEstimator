import { ISelectable } from './base.interface.selectable';

export class SelectableGroup {
  public group: ISelectable[];
  public title: string;
  public active: boolean;

  public selectedItem: ISelectable;

  constructor(group?: ISelectable[], selectedItemID?: string, title: string = 'SelectableGroup Title') {
    this.title = title;
    this.group = group;
    this.setSelected(selectedItemID);
  }

  public setSelected(id: string) {
    if (this.group !== undefined) {
      if (this.getItemByID(id).interactive) {
        this.group.forEach(item => {
          if ((id !== undefined && item.id) === id) {
            item.selected = true;
            this.selectedItem = item;
          } else {
            item.selected = false;
          }
        });
      }
    }
  }

  private getItemByID(id: string): ISelectable {
    let item: ISelectable;
    this.group.forEach(i => {
      if (i.id === id) {
        item = i;
      }
    });

    if (item !== undefined) {
      return item;
    } else {
      throw new Error('Item not found in group!');
    }
  }
}
