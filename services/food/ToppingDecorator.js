class ToppingDecorator {
    constructor(food) {
        this.food = food;
    }

    getId() {
        return this.food.getId();
    }

    getName() {
        return this.food.getName();
    }

    getPrice() {
        return this.food.getPrice();
    }

    getToppings() {
        return this.food.getToppings();
    }

    toJSON() {
        return {
            id: this.getId(),
            name: this.getName(),
            price: this.getPrice(),
            toppings: this.getToppings(),
        };
    }
}

class ExtraCheese extends ToppingDecorator {
    getName() {
        return this.food.getName() + ' + Thêm Phô Mai';
    }

    getPrice() {
        return this.food.getPrice() + 10;
    }

    getToppings() {
        return [...this.food.getToppings(), 'Thêm Phô Mai'];
    }
}

class ExtraSauce extends ToppingDecorator {
    getName() {
        return this.food.getName() + ' + Thêm Sốt';
    }

    getPrice() {
        return this.food.getPrice() + 5;
    }

    getToppings() {
        return [...this.food.getToppings(), 'Thêm Sốt'];
    }
}

class NoOnion extends ToppingDecorator {
    getToppings() {
        return [...this.food.getToppings(), 'Không Hành'];
    }
}

class ExtraMeat extends ToppingDecorator {
    getName() {
        return this.food.getName() + ' + Thêm Thịt';
    }

    getPrice() {
        return this.food.getPrice() + 20;
    }

    getToppings() {
        return [...this.food.getToppings(), 'Thêm Thịt'];
    }
}

class Spicy extends ToppingDecorator {
    getName() {
        return this.food.getName() + ' + Cay';
    }

    getToppings() {
        return [...this.food.getToppings(), 'Cay'];
    }
}

class ExtraVeggies extends ToppingDecorator {
    getName() {
        return this.food.getName() + ' + Thêm Rau';
    }

    getPrice() {
        return this.food.getPrice() + 8;
    }

    getToppings() {
        return [...this.food.getToppings(), 'Thêm Rau'];
    }
}

class NoDressing extends ToppingDecorator {
    getToppings() {
        return [...this.food.getToppings(), 'Không Sốt'];
    }
}

class ExtraIce extends ToppingDecorator {
    getToppings() {
        return [...this.food.getToppings(), 'Thêm Đá'];
    }
}

class NoSugar extends ToppingDecorator {
    getToppings() {
        return [...this.food.getToppings(), 'Không Đường'];
    }
}

function applyToppings(food, options = {}) {
    let result = food;

    if (options.extraCheese) result = new ExtraCheese(result);
    if (options.extraSauce) result = new ExtraSauce(result);
    if (options.noOnion) result = new NoOnion(result);
    if (options.extraMeat) result = new ExtraMeat(result);
    if (options.spicy) result = new Spicy(result);
    if (options.extraVeggies) result = new ExtraVeggies(result);
    if (options.noDressing) result = new NoDressing(result);
    if (options.extraIce) result = new ExtraIce(result);
    if (options.noSugar) result = new NoSugar(result);

    return result;
}

export {
    ToppingDecorator,
    ExtraCheese,
    ExtraSauce,
    NoOnion,
    ExtraMeat,
    Spicy,
    ExtraVeggies,
    NoDressing,
    ExtraIce,
    NoSugar,
    applyToppings,
};