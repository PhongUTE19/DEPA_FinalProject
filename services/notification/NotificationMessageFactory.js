export class NotificationMessageFactory {
    static build(event, data, type) {
        const map = {
            ORDER_CREATED: {
                USER: () => `Đơn hàng #${data.orderId} đã được tạo. Vui lòng chờ xác nhận.`,
                KITCHEN: () => `Có đơn hàng mới #${data.orderId} cần xác nhận!`,
            },
            ORDER_STATUS_CHANGED: {
                USER: () => `Đơn hàng #${data.orderId} chuyển sang: ${data.status}.`,
                KITCHEN: () => {
                    if (data.status === 'PREPARING') return `Đơn #${data.orderId} đang chế biến.`;
                    if (data.status === 'READY') return `Đơn #${data.orderId} xong, sẵn sàng phục vụ!`;
                    return null;
                },
            },
            ORDER_COMPLETED: {
                USER: () => `Đơn hàng #${data.orderId} hoàn thành. Cảm ơn bạn!`,
                KITCHEN: null,
            },
            ORDER_CANCELLED: {
                USER: () => `Đơn hàng #${data.orderId} đã bị huỷ.`,
                KITCHEN: () => `Đơn #${data.orderId} bị huỷ — dừng chế biến.`,
            },
            ORDER_PAID: {
                USER: () => `Thanh toán đơn #${data.orderId} thành công. Mã GD: ${data.transactionId}.`,
                KITCHEN: () => `Đơn #${data.orderId} đã thanh toán — bắt đầu chế biến!`,
            },
            PAYMENT_FAILED: {
                USER: () => `Thanh toán đơn #${data.orderId} thất bại. Vui lòng thử lại.`,
                KITCHEN: null,
            },
        };

        const builder = map[event]?.[type];
        if (!builder) return null;
        try { return builder(); } catch { return null; }
    }
}
