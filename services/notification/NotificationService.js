/**
 * NotificationService
 *
 * Điểm vào DUY NHẤT để ghi/đọc notification vào DB.
 * UserNotifier và KitchenNotifier gọi Service này — KHÔNG gọi Model trực tiếp.
 * Controller gọi Service này — KHÔNG gọi Model trực tiếp.
 *
 * Mọi method trả về Notification domain object (hoặc mảng).
 */
import NotificationModel from '../../models/notification.model.js';
import { Notification, NOTIFICATION_TYPE } from './Notification.js';

export const NotificationService = {

    /**
     * Tạo bản ghi thông báo mới → Notification domain
     */
    async createRecord({ userId, orderId, type, event, message }) {
        const row = await NotificationModel.create({ userId, orderId, type, event, message });
        return Notification.fromRow(row);
    },

    /** Thông báo của một user → Notification domain[] */
    async findByUserId(userId) {
        const rows = await NotificationModel.findByUserId(userId);
        return rows.map(Notification.fromRow);
    },

    /** Thông báo bếp → Notification domain[] */
    async findKitchenNotifications() {
        const rows = await NotificationModel.findKitchenNotifications();
        return rows.map(Notification.fromRow);
    },

    /** Lấy một thông báo theo id → Notification domain */
    async findById(id) {
        const row = await NotificationModel.findById(id);
        return row ? Notification.fromRow(row) : null;
    },

    /** Đếm thông báo chưa đọc của user */
    async countUnread(userId) {
        return NotificationModel.countUnread(userId);
    },

    /** Đánh dấu tất cả đã đọc cho user */
    async markAllAsRead(userId) {
        return NotificationModel.markAllAsRead(userId);
    },

    /** Đánh dấu một thông báo đã đọc */
    async markAsRead(id) {
        return NotificationModel.markAsRead(id);
    },
};
