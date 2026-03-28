﻿// Base Food class
export class Food {
  constructor({ id, name, price }) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}

// Factory interface (for clarity/readability)
export class IFoodFactory {
  create(type) {
    throw new Error(`create(${type}) must be implemented`);
  }
}

// Concrete Factory
export class FoodFactory extends IFoodFactory {
  constructor() {
    super();
    // Minimal catalog for demo; could be loaded from DB later
    this.catalog = {
      pizza: new Food({ id: 1, name: 'Pizza', price: 100 }),
      burger: new Food({ id: 2, name: 'Burger', price: 70 }),
      drink: new Food({ id: 3, name: 'Drink', price: 20 })
    };

    // Exception Flow: Mock Database Inventory for Decorators
    this.inventory = {
      'boba': 100,
      'cheese foam': 50,
      'fresh strawberries': 0 // 0 inventory triggers "Out of Stock"
    };
  }

  create(type) {
    const key = String(type || '').toLowerCase();
    const food = this.catalog[key];
    if (!food) throw new Error(`Unknown food type: ${type}`);
    // return a shallow copy to avoid shared mutation
    return new Food({ id: food.id, name: food.name, price: food.price });
  }

  list() {
    return Object.values(this.catalog).map(f => new Food({ id: f.id, name: f.name, price: f.price }));
  }

  // Main Flow: Factory dynamically "wraps" the base item
  applyOptions(baseFood, options = []) {
    let decoratedFood = baseFood;
    for (const opt of options) {
      const optionName = String(opt).toLowerCase();
      
      // Exception Flow: Topping Out of Stock
      if (this.inventory[optionName] === 0) {
        throw new Error(`Topping Out of Stock: '${opt}' is temporarily sold out.`);
      }

      if (optionName === 'extra cheese') decoratedFood = new ExtraCheese(decoratedFood);
      else if (optionName === 'spicy sauce') decoratedFood = new SpicySauce(decoratedFood);
      else if (optionName === 'vegan option') decoratedFood = new VeganOption(decoratedFood);
      else if (optionName === 'extra bacon') decoratedFood = new ExtraBacon(decoratedFood);
      else if (optionName === 'boba') decoratedFood = new Boba(decoratedFood);
      else if (optionName === 'cheese foam') decoratedFood = new CheeseFoam(decoratedFood);
    }
    return decoratedFood;
  }
}

// Decorator base
export class ToppingDecorator extends Food {
  constructor(food) {
    super(food);
    this.food = food;
  }

  get name() {
    return this.food.name;
  }

  get price() {
    return this.food.price;
  }
}

// Concrete decorators
export class ExtraCheese extends ToppingDecorator {
  get name() { return `${this.food.name} + Extra Cheese`; }
  get price() { return this.food.price + 10; }
}

export class SpicySauce extends ToppingDecorator {
  get name() { return `${this.food.name} + Spicy Sauce`; }
  get price() { return this.food.price + 5; }
}

export class VeganOption extends ToppingDecorator {
  get name() { return `${this.food.name} (Vegan)`; }
  get price() { return this.food.price + 0; }
}

export class ExtraBacon extends ToppingDecorator {
  get name() { return `${this.food.name} + Extra Bacon`; }
  get price() { return this.food.price + 15; }
}

export class Boba extends ToppingDecorator {
  get name() { return `${this.food.name} + Boba`; }
  get price() { return this.food.price + 5; }
}

export class CheeseFoam extends ToppingDecorator {
  get name() { return `${this.food.name} + Cheese Foam`; }
  get price() { return this.food.price + 10; }
}
