
export class IObserver {
    /**
     * @param {string} event - event name (ORDER_PAID, ORDER_STATUS_CHANGED, ...)
     * @param {object} data  - accompanying data
     */
    update(event, data) {
        throw new Error(`update(${event}, ${JSON.stringify(data)}) must be implemented by subclass`);
    }
}
