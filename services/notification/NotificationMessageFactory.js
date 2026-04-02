/**
 * NotificationMessageFactory — Factory Method Pattern
 *
 * Tạo nội dung thông báo dựa trên event + type.
 * Thống nhất event keys với ORDER_STATUS và NOTIFICATION_EVENT.
 */
export class NotificationMessageFactory {
    /**
     * @param {string} event  - 'ORDER_CREATED' | 'ORDER_CONFIRMED' | ... | 'PAYMENT_SUCCESS'
     * @param {object} data   - { orderId, userId, status, transactionId, amount, ... }
     * @param {string} type   - 'USER' | 'KITCHEN'
     * @returns {string|null} - null nếu không có message cho event/type này
     */
    static build(event, data, type) {
        const map = {
            ORDER_CREATED: {
                USER:    () => `Đơn hàng #${data.orderId} đã được tạo thành công. Vui lòng chờ xác nhận.`,
                KITCHEN: () => `Có đơn hàng mới #${data.orderId} cần xác nhận!`,
            },
            ORDER_CONFIRMED: {
                USER:    () => `Đơn hàng #${data.orderId} đã được xác nhận và đang chuẩn bị chế biến.`,
                KITCHEN: () => `Đơn hàng #${data.orderId} đã xác nhận — bắt đầu chế biến!`,
            },
            ORDER_STATUS_CHANGED: {
                USER:    () => `Đơn hàng #${data.orderId} đã chuyển sang trạng thái: ${data.status}.`,
                KITCHEN: () => {
                    if (data.status === 'PREPARING') return `Đơn hàng #${data.orderId} đang được chế biến.`;
                    if (data.status === 'READY')     return `Đơn hàng #${data.orderId} đã xong, sẵn sàng phục vụ!`;
                    return null;
                },
            },
            ORDER_COMPLETED: {
                USER:    () => `Đơn hàng #${data.orderId} đã hoàn thành. Cảm ơn bạn!`,
                KITCHEN: null,
            },
            ORDER_CANCELLED: {
                USER:    () => `Đơn hàng #${data.orderId} đã bị huỷ.`,
                KITCHEN: () => `Đơn hàng #${data.orderId} bị huỷ — dừng chế biến.`,
            },
            ORDER_PAID: {
                USER:    () => `Thanh toán đơn hàng #${data.orderId} thành công. Mã GD: ${data.transactionId}.`,
                KITCHEN: () => `Đơn hàng #${data.orderId} đã thanh toán — bắt đầu chế biến!`,
            },
            PAYMENT_SUCCESS: {
                USER:    () => `Giao dịch ${data.transactionId} thành công. Số tiền: ${data.amount?.toLocaleString('vi-VN')}đ.`,
                KITCHEN: null,
            },
            PAYMENT_FAILED: {
                USER:    () => `Thanh toán đơn hàng #${data.orderId} thất bại. Vui lòng thử lại.`,
                KITCHEN: null,
            },
        };

        const builder = map[event]?.[type];
        if (!builder) return null;
        try {
            return builder();
        } catch {
            return null;
        }
    }
}
