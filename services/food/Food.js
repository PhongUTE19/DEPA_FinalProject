export class Food {
    constructor({ id, name, basePrice, type = 'food', isAvailable = true, imageUrl = null, description = null }) {
        this.id = id;
        this.name = name;
        this.basePrice = Number(basePrice) || 0;
        this.type = type;
        this.isAvailable = Boolean(isAvailable);
        this.imageUrl = imageUrl;
        this.description = description;
    }

    getId() { return this.id; }
    getName() { return this.name; }
    getPrice() { return this.basePrice; }
    getToppings() { return []; }

    static fromRow(row) {
        if (!row) return null;
        return new Food({
            id: row.id,
            name: row.name,
            basePrice: row.base_price ?? row.basePrice ?? row.price ?? 0,
            type: row.type ?? 'food',
            isAvailable: row.is_available ?? row.isAvailable ?? true,
            imageUrl: row.image_url ?? row.imageUrl ?? null,
            description: row.description ?? null,
        });
    }

    toJSON() {
        return {
            id: this.getId(),
            name: this.getName(),
            price: this.getPrice(),
            basePrice: this.basePrice,
            toppings: this.getToppings(),
            type: this.type,
            isAvailable: this.isAvailable,
            imageUrl: this.imageUrl,
            description: this.description,
        };
    }
}
