class Food {
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

class Pizza   extends Food { constructor(d) { super({ ...d, type: 'pizza'   }); } }
class Salad   extends Food { constructor(d) { super({ ...d, type: 'salad'   }); } }
class Pasta   extends Food { constructor(d) { super({ ...d, type: 'pasta'   }); } }
class Burger  extends Food { constructor(d) { super({ ...d, type: 'burger'  }); } }
class Drink   extends Food { constructor(d) { super({ ...d, type: 'drink'   }); } }
class Soup    extends Food { constructor(d) { super({ ...d, type: 'soup'    }); } }
class Dessert extends Food { constructor(d) { super({ ...d, type: 'dessert' }); } }

class FoodFactory {
  static create(type, data) {
    switch (type.toLowerCase()) {
      case 'pizza':   return new Pizza(data);
      case 'salad':   return new Salad(data);
      case 'pasta':   return new Pasta(data);
      case 'burger':  return new Burger(data);
      case 'drink':   return new Drink(data);
      case 'soup':    return new Soup(data);
      case 'dessert': return new Dessert(data);
      default:        return new Food(data);
    }
  }
}

export default FoodFactory;