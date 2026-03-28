﻿import FoodModel from '../../models/food.model.js';

// Base Food class
export class Food {
  constructor({ id, name, price }) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}

export class IFoodFactory {
  create(type) { throw new Error(`create(${type}) must be implemented`); }
}

export class FoodFactory extends IFoodFactory {
  constructor() {
    super();
    // Fallback catalog used before DB is loaded or if DB is unavailable
    this._catalog = {
      pizza:  new Food({ id: 1, name: 'Pizza',  price: 100 }),
      burger: new Food({ id: 2, name: 'Burger', price: 70  }),
      drink:  new Food({ id: 3, name: 'Drink',  price: 20  }),
    };
    this._loaded = false;

    // Inventory for out-of-stock decorator guard
    this.inventory = {
      'boba':              100,
      'cheese foam':        50,
      'fresh strawberries':  0, // triggers Out of Stock exception
    };
  }

  // FIX: Load catalog from the foods table.
  // Called once at startup from app.js (or lazily on first request).
  async loadFromDB() {
    try {
      const rows = await FoodModel.findAll();
      if (rows && rows.length > 0) {
        this._catalog = {};
        for (const row of rows) {
          const key = row.name.toLowerCase();
          this._catalog[key] = new Food({ id: row.id, name: row.name, price: Number(row.price) });
        }
      }
      this._loaded = true;
    } catch (err) {
      // DB not yet configured — keep hardcoded fallback so the app still works
      console.warn('[FoodFactory] Could not load menu from DB, using fallback catalog:', err.message);
      this._loaded = true;
    }
  }

  // FIX: Create by type name OR by numeric foodId
  create(typeOrId) {
    // Numeric id lookup (used by reorder flow)
    if (typeof typeOrId === 'number' || /^\d+$/.test(String(typeOrId))) {
      const id = Number(typeOrId);
      const found = Object.values(this._catalog).find(f => f.id === id);
      if (!found) throw new Error(`Unknown food id: ${typeOrId}`);
      return new Food({ id: found.id, name: found.name, price: found.price });
    }
    const key = String(typeOrId || '').toLowerCase();
    const food = this._catalog[key];
    if (!food) throw new Error(`Unknown food type: ${typeOrId}`);
    return new Food({ id: food.id, name: food.name, price: food.price });
  }

  list() {
    return Object.values(this._catalog).map(f => new Food({ id: f.id, name: f.name, price: f.price }));
  }

  applyOptions(baseFood, options = []) {
    let decorated = baseFood;
    for (const opt of options) {
      const optionName = String(opt).toLowerCase();

      // Exception Flow: Out of Stock
      if (this.inventory[optionName] === 0) {
        throw new Error(`Topping Out of Stock: '${opt}' is temporarily sold out.`);
      }

      if (optionName === 'extra cheese')   decorated = new ExtraCheese(decorated);
      else if (optionName === 'spicy sauce')  decorated = new SpicySauce(decorated);
      else if (optionName === 'vegan option') decorated = new VeganOption(decorated);
      else if (optionName === 'extra bacon')  decorated = new ExtraBacon(decorated);
      else if (optionName === 'boba')         decorated = new Boba(decorated);
      else if (optionName === 'cheese foam')  decorated = new CheeseFoam(decorated);
    }
    return decorated;
  }
}

// Decorator base
export class ToppingDecorator extends Food {
  constructor(food) { super(food); this.food = food; }
  get name()  { return this.food.name; }
  get price() { return this.food.price; }
}

export class ExtraCheese  extends ToppingDecorator { get name() { return `${this.food.name} + Extra Cheese`;  } get price() { return this.food.price + 10; } }
export class SpicySauce   extends ToppingDecorator { get name() { return `${this.food.name} + Spicy Sauce`;   } get price() { return this.food.price + 5;  } }
export class VeganOption  extends ToppingDecorator { get name() { return `${this.food.name} (Vegan)`;         } get price() { return this.food.price + 0;  } }
export class ExtraBacon   extends ToppingDecorator { get name() { return `${this.food.name} + Extra Bacon`;   } get price() { return this.food.price + 15; } }
export class Boba         extends ToppingDecorator { get name() { return `${this.food.name} + Boba`;          } get price() { return this.food.price + 5;  } }
export class CheeseFoam   extends ToppingDecorator { get name() { return `${this.food.name} + Cheese Foam`;   } get price() { return this.food.price + 10; } }