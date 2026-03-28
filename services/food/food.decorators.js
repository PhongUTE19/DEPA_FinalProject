import { Food } from './food.js';

// Decorator base
export class ToppingDecorator extends Food {
  constructor(food) {
    super(food);
    this.food = food;
  }
}

export class ExtraCheese extends ToppingDecorator {
  constructor(food) {
    super(food);
    this.name = `${food.name} + Extra Cheese`;
    this.price = food.price + 10;
  }
}

export class SpicySauce extends ToppingDecorator {
  constructor(food) {
    super(food);
    this.name = `${food.name} + Spicy Sauce`;
    this.price = food.price + 5;
  }
}

export class VeganOption extends ToppingDecorator {
  constructor(food) {
    super(food);
    this.name = `${food.name} (Vegan)`;
    this.price = food.price + 0;
  }
}

export class ExtraBacon extends ToppingDecorator {
  constructor(food) {
    super(food);
    this.name = `${food.name} + Extra Bacon`;
    this.price = food.price + 15;
  }
}

export class Boba extends ToppingDecorator {
  constructor(food) {
    super(food);
    this.name = `${food.name} + Boba`;
    this.price = food.price + 5;
  }
}

export class CheeseFoam extends ToppingDecorator {
  constructor(food) {
    super(food);
    this.name = `${food.name} + Cheese Foam`;
    this.price = food.price + 10;
  }
}