import * as nanoid from 'nanoid';
import { ISelectable } from '../base/base.interface.selectable';
import { ButtonTypes } from './button-types.enum';

export class Button implements ISelectable {
  public id: string;
  public value?: string;
  public interactive = true;
  public buttonType: ButtonTypes;

  private _selected: boolean;
  public get selected(): boolean {
    return this._selected;
  }
  public set selected(v: boolean) {
    if (v) {
      this.setSelected();
    } else {
      this.setUnselected();
    }
  }

  constructor(val?: string, selected: boolean = false) {
    this.id = nanoid();
    this.value = val;
    this.buttonType = ButtonTypes.button;

    this.selected = selected;
  }

  private setSelected() {
    this._selected = true;

    switch (this.buttonType) {
      case ButtonTypes.button:
        this.buttonType = ButtonTypes.buttonSelected;
        break;
    }
  }

  private setUnselected() {
    this._selected = false;

    switch (this.buttonType) {
      case ButtonTypes.buttonSelected:
        this.buttonType = ButtonTypes.button;
        break;
    }
  }
}
