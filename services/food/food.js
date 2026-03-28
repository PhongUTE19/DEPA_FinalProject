// Base Food class
export class Food {
  constructor({ id, name, price }) {
    this.id = id;
    this.name = name;
    this.price = Number(price || 0);
  }
}
