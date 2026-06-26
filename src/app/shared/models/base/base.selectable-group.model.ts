import { ISelectable } from './base.interface.selectable';

export class SelectableGroup {
  public group?: ISelectable[];
  public title: string;
  public active = true;

  public selectedItem?: ISelectable;

  constructor(group?: ISelectable[], title = 'SelectableGroup Title', selectedItemID?: string) {
    this.title = title;
    this.group = group;
    this.setSelected(selectedItemID);
  }

  public setSelected(id?: string) {
    if (this.group !== undefined && id !== undefined) {
      if (this.getItemByID(id).interactive) {
        this.group.forEach((item) => {
          if (item.id === id) {
            item.selected = true;
            this.selectedItem = item;
            this.active = false;
          } else {
            item.selected = false;
          }
        });
      }
    }
  }

  private getItemByID(id: string): ISelectable {
    const item = this.group?.find((i) => i.id === id);

    if (item !== undefined) {
      return item;
    } else {
      throw new Error('Item not found in group!');
    }
  }
}
