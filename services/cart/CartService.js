
import FoodModel from '../../models/food.model.js';
import { Food } from '../food/Food.js';
import { applyToppings } from '../food/ToppingDecorator.js';
import { FoodFactory } from '../food/FoodFactory.js';

function emptyCart() {
    return { items: [] };
}

function getCart(session) {
    if (!session.cart) session.cart = emptyCart();
    return session.cart;
}

function calcSubtotal(unitPrice, quantity) {
    return Number(unitPrice) * Number(quantity);
}

function cartTotals(cart) {
    const totalQty = cart.items.reduce((s, i) => s + i.quantity, 0);
    const totalAmount = cart.items.reduce((s, i) => s + i.subtotal, 0);
    return { totalQty, totalAmount };
}

export const CartService = {

    getCart(session) {
        const cart = getCart(session);
        return { ...cart, ...cartTotals(cart) };
    },

    async addItem(session, { foodId, quantity = 1, toppingKeys = [] }) {
        const row = await FoodModel.getById(foodId);
        if (!row) throw new Error(`Không tìm thấy món có id: ${foodId}`);

        let food = FoodFactory.create(Food.fromRow(row));
        const options = buildToppingOptions(toppingKeys);
        if (Object.values(options).some(Boolean)) {
            food = applyToppings(food, options);
        }

        const unitPrice = food.getPrice();
        const qty = Math.max(1, Number(quantity));
        const lineKey = `${foodId}::${toppingKeys.slice().sort().join(',')}`;

        const cart = getCart(session);
        const existing = cart.items.find(i => i.lineKey === lineKey);

        if (existing) {
            existing.quantity += qty;
            existing.subtotal = calcSubtotal(existing.unitPrice, existing.quantity);
        } else {
            cart.items.push({
                cartItemId: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                lineKey,
                foodId: Number(foodId),
                name: food.getName(),
                type: food.type,
                imageUrl: food.imageUrl,
                toppings: food.getToppings(),
                toppingKeys,
                unitPrice,
                quantity: qty,
                subtotal: calcSubtotal(unitPrice, qty),
            });
        }

        return { ...cart, ...cartTotals(cart) };
    },

    updateItem(session, { cartItemId, quantity }) {
        const cart = getCart(session);
        const qty = Number(quantity);

        if (qty <= 0) {
            cart.items = cart.items.filter(i => i.cartItemId !== cartItemId);
        } else {
            const item = cart.items.find(i => i.cartItemId === cartItemId);
            if (item) {
                item.quantity = qty;
                item.subtotal = calcSubtotal(item.unitPrice, qty);
            }
        }

        return { ...cart, ...cartTotals(cart) };
    },

    removeItem(session, cartItemId) {
        const cart = getCart(session);
        cart.items = cart.items.filter(i => i.cartItemId !== cartItemId);
        return { ...cart, ...cartTotals(cart) };
    },

    clearCart(session) {
        session.cart = emptyCart();
        return { ...emptyCart(), totalQty: 0, totalAmount: 0 };
    },

    toOrderItems(session) {
        const cart = getCart(session);
        if (!cart.items.length) throw new Error('Giỏ hàng trống');
        return cart.items.map(i => ({
            foodId: i.foodId,
            name: i.name,
            quantity: i.quantity,
            toppings: i.toppings,
        }));
    },
};

// helpers 
function buildToppingOptions(keys = []) {
    const valid = [
        'extraCheese', 'extraSauce', 'noOnion',
        'extraMeat', 'spicy', 'extraVeggies',
        'noDressing', 'extraIce', 'noSugar',
    ];
    const opts = {};
    for (const k of valid) opts[k] = keys.includes(k);
    return opts;
}