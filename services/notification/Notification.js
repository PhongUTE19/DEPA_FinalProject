export class Notification {
  constructor({ userId, orderId, type, event, message }) {
    this.userId = userId;
    this.orderId = orderId;
    this.type = type;
    this.event = event;
    this.message = message;
    this.createdAt = new Date();
    this.isSeen = false;
  }

  toJSON() {
    return { ...this };
  }
}