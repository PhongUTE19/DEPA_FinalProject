export class Payment {
    constructor({
        orderId,
        userId = null,
        method,
        amount,
        status,
        transactionId,
        paidAt,
        failureReason,
    }) {
        this.orderId = orderId;
        this.userId = userId;
        this.method = method;
        this.amount = Number(amount || 0);

        this.status = status || 'pending';
        this.transactionId = transactionId ?? null;
        this.paidAt = paidAt ?? null;
        this.failureReason = failureReason ?? null;
    }

    static fromRow(row) {
        if (!row) return null;
        return new Payment({
            orderId: row.order_id,
            userId: row.user_id,
            method: row.method,
            amount: row.amount,
            status: row.status,
            transactionId: row.transaction_id,
            paidAt: row.paid_at,
        });
    }

    markSuccess(transactionId) {
        this.status = 'success';
        this.transactionId = transactionId;
        this.paidAt = new Date().toISOString();
    }

    markFailed(reason = null) {
        this.status = 'failed';
        this.failureReason = reason;
    }

    isSuccess() {
        return this.status === 'success';
    }

    toJSON() {
        return {
            orderId: this.orderId,
            userId: this.userId,
            method: this.method,
            amount: this.amount,
            status: this.status,
            transactionId: this.transactionId,
            paidAt: this.paidAt,
            failureReason: this.failureReason,
        };
    }
}