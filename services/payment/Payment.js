export const PAYMENT_STATUS = Object.freeze({
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
});

export const PAYMENT_METHOD = Object.freeze({
    CASH: 'cash',
    BANK: 'bank',
    MOMO: 'momo',
});

export class Payment {
    constructor({
        id = null,
        orderId,
        userId = null,
        method,
        amount,
        status = PAYMENT_STATUS.PENDING,
        transactionId = null,
        paidAt = null,
        failureReason = null,
        createdAt = null,
    }) {
        this.id = id;
        this.orderId = orderId;
        this.userId = userId;
        this.method = method;
        this.amount = Number(amount) || 0;
        this.status = status;
        this.transactionId = transactionId;
        this.paidAt = paidAt;
        this.failureReason = failureReason;
        this.createdAt = createdAt;
    }

    markSuccess(transactionId) {
        this.status = PAYMENT_STATUS.SUCCESS;
        this.transactionId = transactionId;
        this.paidAt = new Date();
    }

    markFailed(reason = null) {
        this.status = PAYMENT_STATUS.FAILED;
        this.failureReason = reason;
    }

    markRefunded() {
        if (this.status !== PAYMENT_STATUS.SUCCESS) {
            throw new Error('Chỉ có thể hoàn tiền giao dịch đã thành công');
        }
        this.status = PAYMENT_STATUS.REFUNDED;
    }

    isSuccess() { return this.status === PAYMENT_STATUS.SUCCESS; }
    isPending() { return this.status === PAYMENT_STATUS.PENDING; }
    isFailed() { return this.status === PAYMENT_STATUS.FAILED; }

    static fromRow(row) {
        if (!row) return null;
        return new Payment({
            id: row.id,
            orderId: row.order_id,
            userId: row.user_id,
            method: row.method,
            amount: row.amount,
            status: (row.status || 'PENDING').toUpperCase(),
            transactionId: row.transaction_id,
            paidAt: row.paid_at,
            failureReason: row.failure_reason,
            createdAt: row.created_at,
        });
    }

    toJSON() {
        return {
            id: this.id,
            orderId: this.orderId,
            userId: this.userId,
            method: this.method,
            amount: this.amount,
            status: this.status,
            transactionId: this.transactionId,
            paidAt: this.paidAt,
            failureReason: this.failureReason,
            createdAt: this.createdAt,
        };
    }
}
