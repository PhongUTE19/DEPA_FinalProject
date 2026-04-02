/**
 * FoodFactory — Factory Method Pattern
 *
 * Tạo đúng subclass Food theo type.
 * Mỗi subclass kế thừa Food, chỉ override type để định danh.
 * Dữ liệu luôn đến từ Food.fromRow() trước khi truyền vào đây.
 */
import { Food } from './Food.js';

class Pizza   extends Food { constructor(d) { super({ ...d, type: 'pizza'   }); } }
class Salad   extends Food { constructor(d) { super({ ...d, type: 'salad'   }); } }
class Pasta   extends Food { constructor(d) { super({ ...d, type: 'pasta'   }); } }
class Burger  extends Food { constructor(d) { super({ ...d, type: 'burger'  }); } }
class Drink   extends Food { constructor(d) { super({ ...d, type: 'drink'   }); } }
class Soup    extends Food { constructor(d) { super({ ...d, type: 'soup'    }); } }
class Dessert extends Food { constructor(d) { super({ ...d, type: 'dessert' }); } }

export class FoodFactory {
    /**
     * Nhận Food domain object (đã qua fromRow) → trả subclass đúng type.
     * Không nhận raw DB row.
     *
     * @param {Food} food - domain object
     * @returns {Food}
     */
    static create(food) {
        const type = (food.type || 'food').toLowerCase();
        const data = {
            id:          food.id,
            name:        food.name,
            basePrice:   food.basePrice,
            type:        food.type,
            category:    food.category,
            isAvailable: food.isAvailable,
            imageUrl:    food.imageUrl,
            description: food.description,
        };
        switch (type) {
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
