import NotificationModel from '../../models/notification.model.js';
import { Notification } from './Notification.js';

export const NotificationService = {
	async createRecord(payload) {
		const row = await NotificationModel.create(payload);
		return Notification.fromRow(row);
	},

	async findByUserId(userId) {
		const rows = await NotificationModel.findByUserId(userId);
		return rows.map((row) => Notification.fromRow(row));
	},

	async findKitchenNotifications() {
		const rows = await NotificationModel.findKitchenNotifications();
		return rows.map((row) => Notification.fromRow(row));
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
