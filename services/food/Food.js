export class Food {
  constructor({ id, name, price, type }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.type = type || 'food';
  }
  getInfo() {
    return { id: this.id, name: this.name, price: this.price, type: this.type }
  }
}