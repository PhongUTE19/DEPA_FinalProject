/**
 * Food Domain Object
 *
 * Base class. FoodFactory tạo subclass (Pizza, Burger...).
 * ToppingDecorator bọc bên ngoài để thêm topping.
 *
 * Quy tắc field:
 *   - basePrice : giá gốc từ DB (cột base_price)
 *   - getPrice(): giá cuối — Decorator override để cộng topping
 */
export class Food {
    constructor({ id, name, basePrice, type = 'food', category = 'Khác', isAvailable = true, imageUrl = null, description = null }) {
        this.id          = id;
        this.name        = name;
        this.basePrice   = Number(basePrice) || 0;
        this.type        = type;
        this.category    = category;
        this.isAvailable = Boolean(isAvailable);
        this.imageUrl    = imageUrl;
        this.description = description;
    }

    getId()       { return this.id; }
    getName()     { return this.name; }
    getPrice()    { return this.basePrice; }
    getToppings() { return []; }

    /** Chuyển DB row → Food domain (chỉ FoodModel / FoodService gọi) */
    static fromRow(row) {
        if (!row) return null;
        return new Food({
            id:          row.id,
            name:        row.name,
            basePrice:   row.base_price ?? row.basePrice ?? row.price ?? 0,
            type:        row.type ?? 'food',
            category:    row.category ?? 'Khác',
            isAvailable: row.is_available ?? row.isAvailable ?? true,
            imageUrl:    row.image_url ?? row.imageUrl ?? null,
            description: row.description ?? null,
        });
    }

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
