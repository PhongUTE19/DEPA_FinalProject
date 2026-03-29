
export class IObserver {
    /**
     * @param {string} event - tên sự kiện (ORDER_PAID, ORDER_STATUS_CHANGED, ...)
     * @param {object} data  - dữ liệu kèm theo
     */
    update(event, data) {
        throw new Error('update() must be implemented by subclass');
    }
}
