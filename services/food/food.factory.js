import FoodModel from '../../models/food.model.js';
import { Food } from './food.js';
import { 
  ExtraCheese, SpicySauce, VeganOption, ExtraBacon, Boba, CheeseFoam 
} from './food.decorators.js';

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
      console.warn('[FoodFactory] Could not load menu from DB, using fallback catalog:', err.message);
      this._loaded = true;
    }
  }

  create(typeOrId) {
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

export const sharedFoodFactory = new FoodFactory();