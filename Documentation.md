# 🍔 Online Food Ordering — Tài liệu thống nhất nhóm

> **Môn:** Software Design Pattern  
> **Nhóm:** 4 thành viên — Food / Order / Payment+Notification / Leader  
> **Stack:** Node.js · Express · Handlebars · Supabase (PostgreSQL)

---

## 1. DOMAIN DATA (Chuẩn thống nhất)

> **Quy tắc vàng:** Mọi service chỉ nhận và trả về **domain objects**. Không ai được dùng `row` từ DB trực tiếp ngoài tầng `model/`.

### 1.1 User
```js
class User {
  id: number          // PK
  username: string
  name: string
  email: string
  dob: Date | null
  role: 'CUSTOMER' | 'STAFF' | 'MANAGER'
  createdAt: Date
}
```
- `fromRow(row)` + `toJSON()` bắt buộc.

### 1.2 Food
```js
class Food {
  id: number
  name: string
  basePrice: number   // Giá gốc, KHÔNG bao gồm topping
  type: 'pizza'|'burger'|'pasta'|'salad'|'drink'|'soup'|'dessert'|'food'
  isAvailable: boolean
  imageUrl: string | null
  description: string | null

  // Methods (Decorator pattern bọc ngoài)
  getId(): number
  getName(): string
  getPrice(): number    // Giá cuối (có thể bị Decorator tăng)
  getToppings(): string[]
  toJSON(): object
}
```

### 1.3 OrderItem (sub-domain)
```js
// Plain object — không cần class riêng
{
  foodId: number
  quantity: number       // >= 1
  unitPrice: number      // Giá tại thời điểm đặt (snapshot, KHÔNG phụ thuộc Food sau này)
  toppings: string[]     // Tên topping đã áp dụng, ví dụ ['Thêm Phô Mai', 'Cay']
  subtotal: number       // = unitPrice * quantity (computed)
}
```

### 1.4 Order
```js
class Order {
  id: string             // Format: 'ORD-{timestamp}'
  userId: number | null  // null nếu khách vãng lai
  items: OrderItem[]
  state: OrderState      // State pattern
  createdAt: Date

  // Methods
  addItem(item): void
  calculateTotal(): number
  getStatus(): string    // 'PENDING'|'CONFIRMED'|'PREPARING'|'READY'|'COMPLETED'|'CANCELLED'
  nextState(): void
  setState(state): void
  toJSON(): object
}
```

**Order status flow:**
```
PENDING → CONFIRMED → PREPARING → READY → COMPLETED
                    ↘ CANCELLED (có thể từ PENDING hoặc CONFIRMED)
```
> ⚠️ Code cũ dùng `pending/cooking/done` — thống nhất sang UPPERCASE enum ở trên.

### 1.5 Payment
```js
class Payment {
  id: number | null      // null trước khi lưu DB
  orderId: string
  userId: number | null
  method: 'cash'|'bank'|'momo'
  amount: number
  status: 'PENDING'|'SUCCESS'|'FAILED'|'REFUNDED'
  transactionId: string | null
  paidAt: Date | null
  failureReason: string | null

  // Methods
  markSuccess(transactionId): void
  markFailed(reason?): void
  isSuccess(): boolean
  toJSON(): object
  static fromRow(row): Payment
}
```

### 1.6 Notification
```js
class Notification {
  id: number
  userId: number | null  // null nếu là thông báo bếp
  orderId: string | null
  type: 'USER' | 'KITCHEN'      // Thay thế: user/kitchen
  event: 'ORDER_CREATED'|'ORDER_CONFIRMED'|'ORDER_PREPARING'
       | 'ORDER_READY'|'ORDER_COMPLETED'|'ORDER_CANCELLED'
       | 'PAYMENT_SUCCESS'|'PAYMENT_FAILED'
  message: string
  isRead: boolean
  createdAt: Date

  // Methods
  toJSON(): object
  static fromRow(row): Notification
}
```

---

## 2. DATABASE SCHEMA (Lược đồ thống nhất)

### 2.1 Bảng `users`
| Cột | Kiểu | Ràng buộc |
|-----|------|-----------|
| id | SERIAL | PK |
| username | VARCHAR(50) | UNIQUE, NOT NULL |
| password | TEXT | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| dob | DATE | NULL |
| role | VARCHAR(10) | NOT NULL, DEFAULT 'CUSTOMER', CHECK IN ('CUSTOMER','STAFF','MANAGER') |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### 2.2 Bảng `foods`
| Cột | Kiểu | Ràng buộc |
|-----|------|-----------|
| id | SERIAL | PK |
| name | VARCHAR(150) | NOT NULL |
| base_price | NUMERIC(10,2) | NOT NULL, CHECK >= 0 |
| type | VARCHAR(20) | NOT NULL, DEFAULT 'food' |
| is_available | BOOLEAN | NOT NULL, DEFAULT TRUE |
| image_url | TEXT | NULL |
| description | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

> ⚠️ Code cũ dùng `basePrice` và `price` lẫn lộn. Cột DB dùng `base_price`, domain dùng `basePrice`. `FoodModel` map `row.base_price → basePrice`.

### 2.3 Bảng `orders`
| Cột | Kiểu | Ràng buộc |
|-----|------|-----------|
| id | VARCHAR(30) | PK (format: ORD-{timestamp}) |
| user_id | INTEGER | FK → users(id), NULL OK |
| items | JSONB | NOT NULL, DEFAULT '[]' |
| status | VARCHAR(15) | NOT NULL, CHECK IN ('PENDING','CONFIRMED','PREPARING','READY','COMPLETED','CANCELLED') |
| total_amount | NUMERIC(10,2) | NOT NULL, DEFAULT 0 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

> JSONB `items` chứa mảng `[{foodId, quantity, unitPrice, toppings[], subtotal}]`.

### 2.4 Bảng `payments`
| Cột | Kiểu | Ràng buộc |
|-----|------|-----------|
| id | SERIAL | PK |
| order_id | VARCHAR(30) | NOT NULL, FK → orders(id), UNIQUE |
| user_id | INTEGER | FK → users(id), NULL OK |
| method | VARCHAR(10) | NOT NULL, CHECK IN ('cash','bank','momo') |
| amount | NUMERIC(10,2) | NOT NULL, CHECK >= 0 |
| status | VARCHAR(10) | NOT NULL, DEFAULT 'PENDING', CHECK IN ('PENDING','SUCCESS','FAILED','REFUNDED') |
| transaction_id | VARCHAR(100) | NULL, UNIQUE |
| paid_at | TIMESTAMPTZ | NULL |
| failure_reason | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

> ⚠️ Cũ: `status` mặc định `'success'` → đổi sang `'PENDING'`, chỉ set `SUCCESS` sau khi strategy thành công.

### 2.5 Bảng `notifications`
| Cột | Kiểu | Ràng buộc |
|-----|------|-----------|
| id | SERIAL | PK |
| user_id | INTEGER | FK → users(id), NULL OK (bếp không cần userId) |
| order_id | VARCHAR(30) | FK → orders(id), NULL OK |
| type | VARCHAR(10) | NOT NULL, CHECK IN ('USER','KITCHEN') |
| event | VARCHAR(30) | NOT NULL |
| message | TEXT | NOT NULL |
| is_read | BOOLEAN | NOT NULL, DEFAULT FALSE |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

> ⚠️ Bỏ cột `metadata` (chưa dùng). Cột `is_read` thay cho `isSeen`.

---

## 3. NGUYÊN TẮC LUỒNG DỮ LIỆU

```
Request
  → Controller (đọc req, không import model)
    → Service (business logic, trả domain object)
      → Model (chỉ nơi duy nhất gọi DB, trả raw row)
        → Domain fromRow() (chuyển row → domain object)
      ← Domain object
    ← Domain object
  ← Controller (gọi .toJSON() rồi render/json)
Response
```

**Ai được import gì:**
| Tầng | Được import | KHÔNG được import |
|------|-------------|-------------------|
| Controller | Service | Model, DB |
| Service | Model, domain class, service khác | DB trực tiếp |
| Model | DB (knex/supabase) | Service, domain class |

**Vấn đề cụ thể đã phát hiện và cần fix:**

1. `food.controller.js` đang import trực tiếp `FoodModel` — cần bọc qua `FoodService`.
2. `notification.model.js` dùng `type: 'user'/'kitchen'` (lowercase) — cần thống nhất thành `'USER'/'KITCHEN'`.
3. `payment.model.js` hardcode `status: 'success'` — đổi thành `'PENDING'`, service mới set.
4. `OrderState` dùng `'pending'/'cooking'/'done'` — đổi thành `'PENDING'/'PREPARING'/'COMPLETED'`.
5. `PaymentService.processPayment` kiểm tra status order qua `allowedStatuses = ['pending','new','']` — cần chuẩn hoá.

---

## 4. USE CASES

### 4.1 Danh sách use case theo actor

**Guest (chưa đăng nhập)**
- UC01: Xem trang chủ
- UC02: Xem menu (danh sách món)
- UC03: Xem chi tiết món ăn + chọn topping
- UC04: Đăng ký tài khoản
- UC05: Đăng nhập

**Customer (đã đăng nhập)**
- UC06: Đăng xuất
- UC07: Xem / cập nhật hồ sơ cá nhân
- UC08: Đổi mật khẩu
- UC09: Xem menu
- UC10: Chọn món + tuỳ chỉnh topping → thêm vào giỏ
- UC11: Tạo đơn hàng
- UC12: Xem lịch sử đơn hàng
- UC13: Xem trạng thái đơn hàng
- UC14: Huỷ đơn hàng (khi còn PENDING)
- UC15: Thanh toán đơn hàng (chọn phương thức)
- UC16: Xem lịch sử thanh toán
- UC17: Nhận / xem thông báo

**Staff**
- UC06: Đăng xuất
- UC09: Xem menu
- UC18: Xem danh sách tất cả đơn hàng
- UC19: Xác nhận đơn hàng (PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED)
- UC20: Cập nhật trạng thái đơn hàng
- UC17: Nhận / xem thông báo
- UC21: Gửi thông báo cho khách

**Manager**
- Tất cả UC của Staff cộng thêm:
- UC25: Thêm / sửa / xoá món ăn
- UC26: Quản lý nhân viên (thêm/sửa/đổi vai trò)
- UC27: Xem doanh thu / báo cáo
- UC28: Quản lý danh mục món

---

## 5. THIẾU SÓT PHÁT HIỆN & ĐỀ XUẤT BỔ SUNG

| # | Thiếu sót | Đề xuất |
|---|-----------|---------|
| 1 | Không có `FoodService` — controller gọi thẳng model | Tạo `services/food/FoodService.js` bao gồm `getAll()`, `getById()`, `create()`, `update()`, `delete()` |
| 2 | Không có giỏ hàng (Cart) — khách chọn món xong gửi thẳng | Thêm Cart session-based hoặc local state trước khi tạo Order |
| 3 | Không có UC huỷ đơn | Thêm `OrderService.cancelOrder()` → trạng thái CANCELLED + notify |
| 4 | Manager không có giao diện quản lý | Thêm routes `/admin/foods`, `/admin/users`, `/admin/revenue` |
| 5 | `UserModel` thiếu `findById`, `findAll`, `updateRole` | Bổ sung để Manager quản lý nhân viên |
| 6 | Không có phân quyền middleware theo role | Thêm `roleGuard('MANAGER')` middleware |
| 7 | Không có `User` domain class | Tạo `services/account/User.js` với `fromRow()` + `toJSON()` |
| 8 | Payment status mặc định 'success' | Fix: mặc định 'PENDING', service tự set sau |

---

## 6. DESIGN PATTERNS SỬ DỤNG

| Pattern | File | Mô tả |
|---------|------|-------|
| Factory Method | `FoodFactory.js` | Tạo đúng subclass Food theo `type` |
| Decorator | `ToppingDecorator.js` | Bọc Food để thêm topping, tăng giá |
| State | `OrderState.js` | Quản lý vòng đời trạng thái Order |
| Strategy | `IPaymentStrategy.js` + impl | Chọn phương thức thanh toán linh hoạt |
| Adapter | `PaymentAdapter.js` | Chuẩn hoá input/output các strategy |
| Observer | `OrderSubject.js` + Notifiers | Phát sự kiện khi Order thay đổi |
| Singleton | `config/database.js` | Kết nối DB dùng chung |
| Facade | `OrderService.js` | Che giấu logic phức tạp (tạo order + notify) |

---

*Tài liệu này là nguồn sự thật duy nhất (single source of truth) cho toàn nhóm.*
*Mọi thay đổi domain/DB phải cập nhật tài liệu này trước khi code.*
