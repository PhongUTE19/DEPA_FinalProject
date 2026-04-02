export class Payment {
    constructor({ orderId, userId = null, method, amount }) {
        this.orderId = orderId;
        this.userId = userId;
        this.method = method;
        this.amount = Number(amount || 0);

        this.status = 'pending';
        this.transactionId = null;
        this.paidAt = null;
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
            paidAt: this.paidAt
        };
    }
}