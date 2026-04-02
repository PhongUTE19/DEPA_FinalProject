export class Food {
    constructor({ id, name, basePrice, type, isAvailable }) {
        this.id = id;
        this.name = name;
        this.basePrice = basePrice;
        this.type = type || 'food';
        this.isAvailable = isAvailable;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getPrice() {
        return this.basePrice;
    }

    getToppings() {
        return [];
    }

    toJSON() {
        return {
            id: this.getId(),
            name: this.getName(),
            price: this.getPrice(),
            toppings: this.getToppings(),
            type: this.type,
        };
    }
}