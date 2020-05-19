import * as nanoid from "nanoid";
import { ISelectable } from "../base/base.interface.selectable";

export class Button implements ISelectable {
  public id: string;
  public value?: string;
  public interactive = true;
  public selected: boolean;

  constructor(val?: string, selected: boolean = false) {
    this.id = nanoid();
    this.value = val;
    this.selected = selected;
  }
}
