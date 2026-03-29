class ToppingDecorator {
    constructor(food) {
        this.food = food;
    }
    getInfo() {
        return this.food.getInfo();
    }
}

class ExtraCheese extends ToppingDecorator {
    getInfo() {
        const base = this.food.getInfo();
        return { ...base, name: `${base.name} + Thêm Phô Mai`, price: base.price + 10, toppings: [...(base.toppings || []), 'Thêm Phô Mai'] };
    }
}

class ExtraSauce extends ToppingDecorator {
    getInfo() {
        const base = this.food.getInfo();
        return { ...base, name: `${base.name} + Thêm Sốt`, price: base.price + 5, toppings: [...(base.toppings || []), 'Thêm Sốt'] };
    }
}

class NoOnion extends ToppingDecorator {
    getInfo() {
        const base = this.food.getInfo();
        return { ...base, toppings: [...(base.toppings || []), 'Không Hành'] };
    }
}

class ExtraMeat extends ToppingDecorator {
    getInfo() {
        const base = this.food.getInfo();
        return { ...base, name: `${base.name} + Thêm Thịt`, price: base.price + 20, toppings: [...(base.toppings || []), 'Thêm Thịt'] };
    }
}

class Spicy extends ToppingDecorator {
    getInfo() {
        const base = this.food.getInfo();
        return { ...base, name: `${base.name} + Cay`, toppings: [...(base.toppings || []), 'Cay'] };
    }
}

class ExtraVeggies extends ToppingDecorator {
    getInfo() {
        const base = this.food.getInfo();
        return { ...base, name: `${base.name} + Thêm Rau`, price: base.price + 8, toppings: [...(base.toppings || []), 'Thêm Rau'] };
    }
}

class NoDressing extends ToppingDecorator {
    getInfo() {
        const base = this.food.getInfo();
        return { ...base, toppings: [...(base.toppings || []), 'Không Sốt'] };
    }
}

class ExtraIce extends ToppingDecorator {
    getInfo() {
        const base = this.food.getInfo();
        return { ...base, toppings: [...(base.toppings || []), 'Thêm Đá'] };
    }
}

class NoSugar extends ToppingDecorator {
    getInfo() {
        const base = this.food.getInfo();
        return { ...base, toppings: [...(base.toppings || []), 'Không Đường'] };
    }
}

// --- Helper: nhận vào 1 món ăn + danh sách yêu cầu của khách ---
// Mỗi yêu cầu true/false → true thì bọc thêm 1 lớp topping, false thì bỏ qua
// Ví dụ khách order: "Pizza + thêm phô mai + cay, không cần thêm gì khác"
// → options = { extraCheese: true, spicy: true } → bọc 2 lớp, giá cộng dồn
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

export { ExtraCheese, ExtraSauce, NoOnion, ExtraMeat, Spicy, ExtraVeggies, NoDressing, ExtraIce, NoSugar, applyToppings };
export default ToppingDecorator;