/**
 * User Domain Object
 *
 * Source of truth cho mọi tầng trong hệ thống.
 * KHÔNG dùng raw DB row ra ngoài tầng Model.
 *
 * Role enum:
 *   CUSTOMER | STAFF | CHEF | MANAGER
 */

export const ROLES = Object.freeze({
    CUSTOMER: 'CUSTOMER',
    STAFF:    'STAFF',
    CHEF:     'CHEF',
    MANAGER:  'MANAGER',
});

// Map từ giá trị số (cột cũ permission) sang Role string
const PERMISSION_TO_ROLE = {
    0: ROLES.CUSTOMER,
    1: ROLES.STAFF,
    2: ROLES.CHEF,
    3: ROLES.MANAGER,
};

export class User {
    /**
     * @param {object} params
     * @param {number}      params.id
     * @param {string}      params.username
     * @param {string}      params.name
     * @param {string}      params.email
     * @param {string}      [params.dob]
     * @param {string}      params.role   - một trong ROLES.*
     * @param {Date}        [params.createdAt]
     */
    constructor({ id, username, name, email, dob = null, role = ROLES.CUSTOMER, createdAt = null }) {
        this.id        = id;
        this.username  = username;
        this.name      = name;
        this.email     = email;
        this.dob       = dob;
        this.role      = role;
        this.createdAt = createdAt;
    }

    isCustomer() { return this.role === ROLES.CUSTOMER; }
    isStaff()    { return this.role === ROLES.STAFF; }
    isChef()     { return this.role === ROLES.CHEF; }
    isManager()  { return this.role === ROLES.MANAGER; }

    /** Có quyền Staff-level trở lên (Staff / Chef / Manager) */
    isStaffOrAbove() {
        return [ROLES.STAFF, ROLES.CHEF, ROLES.MANAGER].includes(this.role);
    }

    /** Chuyển DB row → User domain */
    static fromRow(row) {
        if (!row) return null;

        // Hỗ trợ cả cột 'role' (mới) lẫn 'permission' (số cũ)
        let role = ROLES.CUSTOMER;
        if (row.role && Object.values(ROLES).includes(row.role)) {
            role = row.role;
        } else if (row.permission !== undefined && row.permission !== null) {
            role = PERMISSION_TO_ROLE[Number(row.permission)] ?? ROLES.CUSTOMER;
        }

        return new User({
            id:        row.id,
            username:  row.username,
            name:      row.name,
            email:     row.email,
            dob:       row.dob ?? null,
            role,
            createdAt: row.created_at ?? null,
        });
    }

    /** Trả về plain object an toàn để render view / JSON response (bỏ password) */
    toJSON() {
        return {
            id:        this.id,
            username:  this.username,
            name:      this.name,
            email:     this.email,
            dob:       this.dob,
            role:      this.role,
            createdAt: this.createdAt,
        };
    }
}
