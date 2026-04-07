/**
 * Order Domain Object — State Pattern
 *
 * id: number (integer, do DB sinh — SERIAL)
 *   Trước khi lưu DB: id = null
 *   Sau khi lưu DB:   id = số nguyên từ DB
 *
 * items: OrderItem[]
 *   { foodId, quantity, unitPrice, toppings[], subtotal }
 *   unitPrice là snapshot tại thời điểm đặt — không đổi dù Food thay đổi giá sau.
 */
import { PendingState, restoreState } from './OrderState.js';

export class Order {
    constructor({ id = null, userId = null, items = [], createdAt = null }) {
        this.id        = id;       // null trước khi INSERT, integer sau khi INSERT
        this.userId    = userId;
        this.items     = [];
        this.createdAt = createdAt;
        this.state     = new PendingState(this);

        for (const item of items) {
            this._pushItem(item);
        }
    }

    // ── Items ──────────────────────────────────────────────────────────────

    _pushItem(item) {
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
        const quantity  = Math.max(1, Number(item.quantity) || 1);
        this.items.push({
            foodId:   Number(item.foodId),
            quantity,
            unitPrice,
            toppings: Array.isArray(item.toppings) ? item.toppings : [],
            subtotal: unitPrice * quantity,
        });
    }

    addItem(item) { this._pushItem(item); }

    calculateTotal() {
        return this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    }

    // ── State ──────────────────────────────────────────────────────────────

    setState(state)           { this.state = state; }
    nextState()               { this.state.next(); }
    cancelOrder()             { this.state.cancel(); }
    getStatus()               { return this.state.getStatus(); }
    restoreFromStatus(status) { restoreState(this, status); }

    // ── Serialization ──────────────────────────────────────────────────────

    toJSON() {
        return {
            id:          this.id,
            userId:      this.userId,
            items:       this.items,
            status:      this.getStatus(),
            totalAmount: this.calculateTotal(),
            createdAt:   this.createdAt,
        };
    }
}
