/**
 * ToppingDecorator — Decorator Pattern
 *
 * Bọc Food domain object để thêm topping.
 * KHÔNG nhận raw DB row — chỉ nhận Food domain (hoặc decorator khác).
 *
 * Cách dùng:
 *   const food = FoodFactory.create(Food.fromRow(row));
 *   const result = applyToppings(food, { extraCheese: true, spicy: true });
 *   result.toJSON(); // → { price: tổng, toppings: [...] }
 */

class ToppingDecorator {
    constructor(food) {
        this._food = food;
    }

    getId()       { return this._food.getId(); }
    getName()     { return this._food.getName(); }
    getPrice()    { return this._food.getPrice(); }
    getToppings() { return this._food.getToppings(); }

    // Giữ nguyên các field gốc không liên quan đến topping
    get type()        { return this._food.type; }
    get category()    { return this._food.category; }
    get isAvailable() { return this._food.isAvailable; }
    get imageUrl()    { return this._food.imageUrl; }
    get description() { return this._food.description; }
    get basePrice()   { return this._food.basePrice; }

    toJSON() {
        return {
            id:          this.getId(),
            name:        this.getName(),
            price:       this.getPrice(),
            basePrice:   this.basePrice,
            toppings:    this.getToppings(),
            type:        this.type,
            category:    this.category,
            isAvailable: this.isAvailable,
            imageUrl:    this.imageUrl,
            description: this.description,
        };
    }
}

// ===== Concrete Decorators =====

class ExtraCheese extends ToppingDecorator {
    getName()     { return this._food.getName() + ' + Thêm Phô Mai'; }
    getPrice()    { return this._food.getPrice() + 10; }
    getToppings() { return [...this._food.getToppings(), 'Thêm Phô Mai']; }
}

class ExtraSauce extends ToppingDecorator {
    getName()     { return this._food.getName() + ' + Thêm Sốt'; }
    getPrice()    { return this._food.getPrice() + 5; }
    getToppings() { return [...this._food.getToppings(), 'Thêm Sốt']; }
}

class NoOnion extends ToppingDecorator {
    getToppings() { return [...this._food.getToppings(), 'Không Hành']; }
}

class ExtraMeat extends ToppingDecorator {
    getName()     { return this._food.getName() + ' + Thêm Thịt'; }
    getPrice()    { return this._food.getPrice() + 20; }
    getToppings() { return [...this._food.getToppings(), 'Thêm Thịt']; }
}

class Spicy extends ToppingDecorator {
    getName()     { return this._food.getName() + ' + Cay'; }
    getToppings() { return [...this._food.getToppings(), 'Cay']; }
}

class ExtraVeggies extends ToppingDecorator {
    getName()     { return this._food.getName() + ' + Thêm Rau'; }
    getPrice()    { return this._food.getPrice() + 8; }
    getToppings() { return [...this._food.getToppings(), 'Thêm Rau']; }
}

class NoDressing extends ToppingDecorator {
    getToppings() { return [...this._food.getToppings(), 'Không Sốt']; }
}

class ExtraIce extends ToppingDecorator {
    getToppings() { return [...this._food.getToppings(), 'Thêm Đá']; }
}

class NoSugar extends ToppingDecorator {
    getToppings() { return [...this._food.getToppings(), 'Không Đường']; }
}

// ===== Helper áp dụng nhiều topping liên tiếp =====

/**
 * @param {Food} food - Food domain object
 * @param {object} options - { extraCheese, extraSauce, noOnion, extraMeat, spicy,
 *                             extraVeggies, noDressing, extraIce, noSugar }
 * @returns {ToppingDecorator|Food}
 */
export function applyToppings(food, options = {}) {
    let result = food;
    if (options.extraCheese)  result = new ExtraCheese(result);
    if (options.extraSauce)   result = new ExtraSauce(result);
    if (options.noOnion)      result = new NoOnion(result);
    if (options.extraMeat)    result = new ExtraMeat(result);
    if (options.spicy)        result = new Spicy(result);
    if (options.extraVeggies) result = new ExtraVeggies(result);
    if (options.noDressing)   result = new NoDressing(result);
    if (options.extraIce)     result = new ExtraIce(result);
    if (options.noSugar)      result = new NoSugar(result);
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
};
