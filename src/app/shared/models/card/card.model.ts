import * as nanoid from 'nanoid';
import { CardTypes } from './card-types.enum';
import { environment } from 'src/environments/environment';

export class Card {
  public id: string;
  public value?: string;
  public cardType: CardTypes;
  public selected: boolean;

  constructor(val?: string, type?: CardTypes) {
    this.id = nanoid();

    this.value = val;
    this.validateCardValue();

    this.cardType = type || CardTypes.card;
    this.setSelectedFromCardType();
  }

  private validateCardValue() {
    if (!environment.production) {
      if (this.value === undefined) {
        console.log(`card ${this.id} has no value set`);
      } else if (this.value.toString().length > 3) {
        throw new Error('num length is too long to fit in card');
      }
    }
  }

  private setSelectedFromCardType() {
    switch (this.cardType) {
      case CardTypes.displaySelected:
        this.selected = true;
        break;
      case CardTypes.interactiveSelected:
        this.selected = true;
      default:
        this.selected = false;
        break;
    }
  }

  public clickCard() {
    switch (this.cardType) {
      case CardTypes.interactive:
        this.cardType = CardTypes.interactiveSelected;
        break;
      case CardTypes.interactiveSelected:
        this.cardType = CardTypes.interactive;
      default:
        break;
    }

    this.setSelectedFromCardType();
  }
}
