// Base Food class
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
    throw new Error('create(type) must be implemented');
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
