/**
 * Order Domain Object — State Pattern
 *
 * Đây là domain object trung tâm của hệ thống.
 * Mọi tầng (Service, Controller) làm việc qua object này,
 * KHÔNG dùng raw DB row trực tiếp.
 *
 * items: OrderItem[]
 *   { foodId, quantity, unitPrice, toppings[], subtotal }
 *   unitPrice là snapshot tại thời điểm đặt → không đổi dù Food thay đổi giá sau.
 */
import { PendingState, restoreState } from './OrderState.js';

export class Order {
    /**
     * @param {object} params
     * @param {string}       params.id         - 'ORD-{timestamp}'
     * @param {number|null}  [params.userId]
     * @param {Array}        [params.items]    - OrderItem[]
     * @param {string}       [params.status]   - dùng restoreState nếu load từ DB
     * @param {Date}         [params.createdAt]
     */
    constructor({ id, userId = null, items = [], createdAt = null }) {
        this.id        = id;
        this.userId    = userId;
        this.items     = [];
        this.createdAt = createdAt;
        this.state     = new PendingState(this);

        // Nạp items (mỗi item được normalize)
        for (const item of items) {
            this._pushItem(item);
        }
    }

    // ── Items ──────────────────────────────────────────────────────────────

    _pushItem(item) {
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
        const quantity  = Math.max(1, Number(item.quantity) || 1);
        this.items.push({
            foodId:    Number(item.foodId),
            quantity,
            unitPrice,
            toppings:  Array.isArray(item.toppings) ? item.toppings : [],
            subtotal:  unitPrice * quantity,
        });
    }

    addItem(item) { this._pushItem(item); }

    calculateTotal() {
        return this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    }

    // ── State ──────────────────────────────────────────────────────────────

    setState(state)  { this.state = state; }
    nextState()      { this.state.next(); }
    cancelOrder()    { this.state.cancel(); }
    getStatus()      { return this.state.getStatus(); }

    /** Khôi phục state khi load từ DB */
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
