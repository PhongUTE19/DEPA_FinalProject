// In-memory store (can be swapped with DB later)
export class InMemoryOrderStore {
  constructor() { this._map = new Map(); }
  save(order) { this._map.set(order.id, order); return order; }
  get(id) { return this._map.get(id) || null; }
  getAll() { return Array.from(this._map.values()); }
}