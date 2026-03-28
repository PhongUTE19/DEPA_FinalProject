import { Order } from './order.js';

// Builder interface
export class IOrderBuilder {
  addItem(item) { throw new Error(`addItem(${item}) not implemented`); }
  setUser(userId) { throw new Error(`setUser(${userId}) not implemented`); }
  withExtraSauce() { throw new Error('withExtraSauce not implemented'); }
  withoutOnions() { throw new Error('withoutOnions not implemented'); }
  withLessSugar() { throw new Error('withLessSugar not implemented'); }
  addCustomRequest(request) { throw new Error(`addCustomRequest(${request}) not implemented`); }
  build() { throw new Error('build not implemented'); }
}

// Concrete Builder
export class OrderBuilder extends IOrderBuilder {
  constructor() {
    super();
    this._userId = null;
    this._items = [];
    this._customizations = [];
  }

  addItem({ foodId, name, price, quantity = 1, options = [] }) {
    this._items.push({ foodId, name, price, quantity, options });
    return this;
  }

  setUser(userId) { this._userId = userId; return this; }

  withExtraSauce() {
    this._customizations.push('Extra Sauce');
    return this;
  }

  withoutOnions() {
    this._customizations.push('No Onions');
    return this;
  }

  withLessSugar() {
    this._customizations.push('Less Sugar');
    return this;
  }

  addCustomRequest(request) {
    if (request) this._customizations.push(request);
    return this;
  }

  build() {
    // Exception Flow: Contradictory Customizations Validation
    const isVegan = this._customizations.some(c => c.toLowerCase() === 'vegan option') || 
                    this._items.some(i => (i.options || []).some(o => String(o).toLowerCase() === 'vegan option'));
    const hasBacon = this._customizations.some(c => c.toLowerCase() === 'extra bacon') || 
                     this._items.some(i => (i.options || []).some(o => String(o).toLowerCase() === 'extra bacon'));

    if (isVegan && hasBacon) {
      throw new Error('Contradictory Customizations: Cannot combine Vegan Option with Extra Bacon.');
    }

    const id = `${Date.now()}-${Math.floor(Math.random()*1000)}`;
    return new Order({ id, userId: this._userId, items: this._items, customizations: this._customizations });
  }
}