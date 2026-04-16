import hbs_sections from 'express-handlebars-sections';

const helpers = {
	fillSection: hbs_sections(),
	eq(a, b)  { return a === b; },
	ne(a, b)  { return a !== b; },
	gt(a, b)  { return a > b; },
	lt(a, b)  { return a < b; },
	lte(a, b) { return a <= b; },
	gte(a, b) { return a >= b; },

	formatNumber(value) {
		return new Intl.NumberFormat('vi-VN').format(value);
	},
	formatCurrency(value) {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	},
	formatDate(date) {
		if (!date) return '';
		return new Intl.DateTimeFormat('vi-VN', {
			year: 'numeric', month: 'long', day: 'numeric'
		}).format(new Date(date));
	},
	formatDateTime(date) {
		if (!date) return '';
		return new Intl.DateTimeFormat('vi-VN', {
			year: 'numeric', month: '2-digit', day: '2-digit',
			hour: '2-digit', minute: '2-digit',
		}).format(new Date(date));
	},

	repeat(txt, count) { return txt.repeat(count); },

	math(l, op, r) {
		const left = Number(l), right = Number(r);
		switch (op) {
			case '+': return left + right;
			case '-': return left - right;
			case '*': return left * right;
			case '/': return right !== 0 ? left / right : 0;
			default:  return 0;
		}
	},

	range(start, end) {
		const arr = [];
		for (let i = Number(start); i <= Number(end); i++) arr.push(i);
		return arr;
	},

	isNew(createdAt) {
		const days = (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
		return days < 7;
	},

	isEmpty(arr) { return !arr || arr.length === 0; },

	chunk(array, size) {
		if (!Array.isArray(array)) return [];
		const chunks = [];
		for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
		return chunks;
	},

	typeEmoji(type) {
		const map = {
			pizza:'🍕', burger:'🍔', pasta:'🍝',
			salad:'🥗', soup:'🍲', dessert:'🍰', drink:'🥤',
		};
		return map[type] || '🍽️';
	},

	/** Emit a JSON-safe string for inline JS — e.g. {{{json someArray}}} */
	json(value) {
		return JSON.stringify(value ?? null);
	},

	/** Status badge color helper */
	statusColor(status) {
		const map = {
			PENDING:   'warning',
			CONFIRMED: 'info',
			PREPARING: 'primary',
			READY:     'success',
			COMPLETED: 'success',
			CANCELLED: 'danger',
		};
		return map[(status || '').toUpperCase()] || 'secondary';
	},

	/** Status label in Vietnamese */
	statusLabel(status) {
		const map = {
			PENDING:   'Chờ xác nhận',
			CONFIRMED: 'Đã xác nhận',
			PREPARING: 'Đang chế biến',
			READY:     'Sẵn sàng',
			COMPLETED: 'Hoàn thành',
			CANCELLED: 'Đã huỷ',
		};
		return map[(status || '').toUpperCase()] || status;
	},
};

export default helpers;