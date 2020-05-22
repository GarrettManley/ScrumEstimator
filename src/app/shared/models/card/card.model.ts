import * as nanoid from "nanoid";
import { CardTypes } from "./card-types.enum";
import { environment } from "src/environments/environment";
import { ISelectable } from "../base/base.interface.selectable";

export class Card implements ISelectable {
  public id: string;
  public value?: string;
  public cardType: CardTypes;
  public interactive = false;

  private _displayValue = true;
  public get displayValue(): boolean {
    return this._displayValue;
  }
  public set displayValue(v: boolean) {
    this._displayValue = v;
    this.setDisplayClass(v);
  }

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

  constructor(val?: string, type?: CardTypes, selected: boolean = false) {
    this.id = nanoid();

    this.value = val;
    this.validateCardValue();

    this.cardType = type || CardTypes.card;

    this.setNumDisplay();

    this.selected = selected;

    this.setInteractive();
  }

  private validateCardValue() {
    if (!environment.production) {
      if (this.value === undefined) {
        console.log(`card ${this.id} has no value set`);
      } else if (this.value.toString().length > 3) {
        throw new Error("num length is too long to fit in card");
      }
    }
  }

  private setNumDisplay() {
    switch (this.cardType) {
      case CardTypes.display:
        this.displayValue = false;
        break;
    }
  }

  private setDisplayClass(display: boolean) {
    if (display) {
      if (this.cardType === CardTypes.display) {
        this.cardType = CardTypes.displayShown;
      }
      if (this.cardType === CardTypes.displaySelected) {
        this.cardType = CardTypes.displayShownSelected;
      }
    } else {
      if (this.cardType === CardTypes.displayShown) {
        this.cardType = CardTypes.display;
      }
      if (this.cardType === CardTypes.displayShownSelected) {
        this.cardType = CardTypes.displaySelected;
      }
    }
  }

  private setSelected() {
    this._selected = true;

    switch (this.cardType) {
      case CardTypes.display:
        this.cardType = CardTypes.displaySelected;
        break;
      case CardTypes.interactive:
        this.cardType = CardTypes.interactiveSelected;
        break;
    }
  }

  private setUnselected() {
    this._selected = false;

    switch (this.cardType) {
      case CardTypes.displaySelected:
        this.cardType = CardTypes.display;
        break;
      case CardTypes.interactiveSelected:
        this.cardType = CardTypes.interactive;
        break;
    }
  }

  private setInteractive() {
    switch (this.cardType) {
      case CardTypes.interactive:
      case CardTypes.interactiveSelected:
        this.interactive = true;
        break;
      default:
        this.interactive = false;
        break;
    }
  }
}
