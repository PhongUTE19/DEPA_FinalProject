export class NotificationMessageFactory {
    static build(event, data, type) {
        const map = {
            ORDER_PAID: {
                user: () => `Thanh toán đơn hàng #${data.orderId} thành công. Mã GD: ${data.transactionId}`,
                kitchen: () => `Đơn hàng #${data.orderId} đã thanh toán - bắt đầu chế biến!`
            },

            ORDER_STATUS_CHANGED: {
                user: () => `Đơn hàng #${data.orderId} đã chuyển sang trạng thái: ${data.status}`,
                kitchen: () => {
                    if (data.status === 'cooking')
                        return `Đơn hàng #${data.orderId} đang chế biến`;
                    if (data.status === 'done')
                        return `Đơn hàng #${data.orderId} đã xong, sẵn sàng giao`;
                    return null;
                }
            },

            ORDER_CANCELLED: {
                kitchen: () => `Đơn hàng #${data.orderId} đã bị hủy - dừng chế biến`
            }
        };

        return map[event]?.[type]?.() ?? null;
    }
}