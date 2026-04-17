export const ROLES = Object.freeze({
    CUSTOMER: 'CUSTOMER',
    STAFF: 'STAFF',
    MANAGER: 'MANAGER',
});

export class User {
    constructor({ id, username, name, email, dob = null, role = ROLES.CUSTOMER, createdAt = null }) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.dob = dob;
        this.role = role;
        this.createdAt = createdAt;
    }

    isCustomer() { return this.role === ROLES.CUSTOMER; }
    isStaff() { return this.role === ROLES.STAFF; }
    isManager() { return this.role === ROLES.MANAGER; }
    isStaffOrAbove() { return [ROLES.STAFF, ROLES.MANAGER].includes(this.role); }

    static fromRow(row) {
        if (!row) return null;

        // Đọc cột role từ DB (text). Nếu giá trị không hợp lệ → mặc định CUSTOMER.
        const role = Object.values(ROLES).includes(row.role)
            ? row.role
            : ROLES.CUSTOMER;

        return new User({
            id: row.id,
            username: row.username,
            name: row.name,
            email: row.email,
            dob: row.dob ?? null,
            role,
            createdAt: row.created_at ?? null,
        });
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            name: this.name,
            email: this.email,
            dob: this.dob,
            role: this.role,
            createdAt: this.createdAt,
        };
    }
}
