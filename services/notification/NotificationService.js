import NotificationModel from '../../models/notification.model.js';
import { Notification, NOTIFICATION_TYPE } from './Notification.js';

export const NotificationService = {
    async createRecord({ userId, orderId, type, event, message }) {
        const row = await NotificationModel.create({ userId, orderId, type, event, message });
        return Notification.fromRow(row);
    },

    async findByUserId(userId) {
        const rows = await NotificationModel.findByUserId(userId);
        return rows.map(Notification.fromRow);
    },

    async findKitchenNotifications() {
        const rows = await NotificationModel.findKitchenNotifications();
        return rows.map(Notification.fromRow);
    },

    async findById(id) {
        const row = await NotificationModel.findById(id);
        return row ? Notification.fromRow(row) : null;
    },

    async countUnread(userId) {
        return NotificationModel.countUnread(userId);
    },

    async markAllAsRead(userId) {
        return NotificationModel.markAllAsRead(userId);
    },

    async markAsRead(id) {
        return NotificationModel.markAsRead(id);
    },
};
