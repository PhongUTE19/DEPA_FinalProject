# 🍔 Building an online food ordering website
(Web-based, Node.js + Express + Handlebars + Supabase)

---

## 1. 🎯 MỤC TIÊU DỰ ÁN

Xây dựng một hệ thống đặt món ăn online đơn giản.
### Mục tiêu chính:
> Áp dụng các **Design Pattern (GoF)** để xây dựng hệ thống linh hoạt, dễ mở rộng.

### Chức năng chính:
- Xem menu
- Chọn món ăn
- Tùy chỉnh món (topping, yêu cầu riêng)
- Tạo đơn hàng
- Thanh toán
- Cập nhật trạng thái đơn hàng
- Gửi thông báo (user, bếp, ...)

### Yêu cầu:
Hệ thống chạy được
Áp dụng nhiều Design Pattern
Áp dụng Design Pattern ở nhiều tính năng (Factory, Strategy, Observer)

Mỗi thành viên phải hiểu và giải thích được pattern mình làm:
- Dùng pattern nào
- Tại sao dùng
- Lợi ích là gì

---

## 2. 🧠 DESIGN PATTERN MAPPING

### Factory Method
- Tạo món ăn (Food)
- Tạo phương thức thanh toán (Payment)
- Tạo thông báo (Notification)

### Strategy
- Xử lý thanh toán
- Tính giá (pricing)
- Áp dụng giảm giá (discount)

### Observer
- Thông báo khi trạng thái đơn hàng thay đổi
- Thông báo thanh toán
- Thông báo cho bếp

### Decorator
- Tùy chỉnh món ăn (thêm topping)

### Builder
- Tạo Order phức tạp

### State
- Quản lý trạng thái đơn hàng (pending, cooking, delivery...)

### Facade
- Xử lý flow tổng thể của Order

### Adapter
- Chuẩn hóa các API thanh toán khác nhau

### Singleton
- Quản lý resource chung (config, DB, ...)

---

## 3. 🏗️ KIẾN TRÚC HỆ THỐNG

### Frontend (Handlebars)
views/
layouts/ → layout chung
pages/ → từng trang (home, menu, account…)
partials/ → component nhỏ (header, footer…)

public/
css/ → style
imgs/ → hình ảnh

---

### Backend
controllers/ → nhận request, trả response
services/ → business logic **(nơi áp dụng Design Patterns)**
routes/ → định nghĩa API
middlewares/ → xử lý trung gian
helpers/ → hàm tiện ích
config/ → cấu hình
app.js → entry point

---

### Database (Supabase)
models/ → định nghĩa cấu trúc dữ liệu + tương tác với Supabase

Các bảng chính:
- User
- Food
- Order
- Payment

---

## 4. 🔗 API CONTRACT (RẤT QUAN TRỌNG)

GET /menu
Response:
[
  {
    "id": 1,
    "name": "Pizza",
    "price": 100
  }
]

POST /order
Request:
{
  "items": [
    {
      "foodId": 1,
      "quantity": 2,
      "options": {
        "extraCheese": true,
        "noOnion": false
      }
    }
  ]
  "paymentMethod": "cash"
}

Response:
{
  "orderId": 1,
  "status": "pending"
}

POST /payment
PATCH /order/status

---

## 5. 🧩 CORE INTERFACES (ABSTRACTION)

### Strategy
IPaymentStrategy
- pay(order): PaymentResult

### Factory Method
IFoodFactory
- create(type): Food

### Observer
IObserver
- update(event): void

### Builder
IOrderBuilder
- addItem(item)
- build(): Order

---

## 6. 📌 NGUYÊN TẮC CODE
API không thay đổi lung tung
Dùng đúng Design Pattern
Không dùng if-else khi có thể dùng Strategy
Không tạo object trực tiếp khi cần Factory
Luôn theo pattern đã định
Đặt tên class Pascal Case (PaymentStrategy, FoodFactory)

---

## 7. ⚡ CÁCH LÀM (QUAN TRỌNG - ĐỌC KỸ)

Sự phụ thuộc: Food → Order → Payment → Notification

Flow phát triển: Simple → Running → Expand → Polish
- Simple
    Làm từ flow nhỏ trước.
    Mock nếu cần.
    Luôn test sau khi code xong từng phần.
    Không chờ nhau hoàn chỉnh.
- Running
    Chỉ cần version đơn giản.
- Expand
    Sau đó mới mở rộng thêm payment, decorator, notification

---

## 8. 🔀 GIT WORKFLOW (BẮT BUỘC)

### 1. Branch chính

- main: code ổn định (demo được)
- develop: code đang phát triển

---

### 2. Tạo branch

Mỗi người làm việc trên branch riêng:

Format:
feature/<tên-tính-năng>

Ví dụ:
- feature/food
- feature/order
- feature/payment
- feature/notification

---

### 3. Quy trình làm việc

Bước 1: Pull code mới nhất
git pull origin develop

Bước 2: Tạo branch
git checkout -b feature/<tên>

Bước 3: Code + commit

Bước 4: Push
git push origin feature/<tên>

Bước 5: Tạo Pull Request → merge vào develop

---

### 4. Quy tắc commit

Format:
<type>: <message>

Ví dụ:
- feat: add create order API
- fix: fix payment bug
- refactor: improve order builder

---

### 5. Quy tắc merge

- KHÔNG push trực tiếp vào develop
- PHẢI tạo Pull Request
- Leader review trước khi merge

---

### 6. Lưu ý quan trọng

- Pull code trước khi code
- Không sửa code của người khác nếu chưa trao đổi
- Nếu conflict → báo leader xử lý

## 9. 👥 PHÂN CÔNG CÔNG VIỆC

### Mỗi Thành viên
- Làm 1–2 tính năng
- Áp dụng pattern tương ứng
- Implement logic
- Làm DB phần của mình
- Tuân thủ API & interface

### 👤 Person A — Food Domain
Pattern:
    - Factory Method
    - Decorator

Nhiệm vụ:
1. Tạo Food cơ bản
    - id, name, price

2. Factory:
    - tạo các loại food (Pizza, Drink…)

3. Decorator:
    - thêm topping (cheese, sauce…)

4. API:
GET /menu
Deliverable (bắt buộc có):
    - Food model
    - FoodFactory
    - ToppingDecorator
    - API /menu chạy được

5. Mức tối thiểu (rất quan trọng):
Chỉ cần trả:
    - id
    - name
    - price

👉 ❌ chưa cần topping full

### 👤 Person B — Order Domain
Pattern:
    - Builder
    - State

Nhiệm vụ:
1. Create Order
    - items (foodId, quantity)

2. Builder:
    - build order

3. State:
    - pending → cooking → done

4. API:
POST /order
PATCH /order/status
Deliverable:
    - Order model
    - OrderBuilder
    - OrderState
    - API tạo order chạy được

5. Mức tối thiểu:
    - chỉ cần foodId (không cần full Food object)
    - status = pending là đủ ban đầu

👉 💥 giúp không bị phụ thuộc Food

### 👤 Person C — Payment + Notification
Pattern:
    - Strategy Pattern
    - Adapter Pattern
    - Observer Pattern

Nhiệm vụ:
1. Payment:
    - Strategy (cash, bank…)

2. Adapter:
    - chuẩn hóa payment

3. Observer:
    - notify khi order change

4. API:
POST /payment
Deliverable:
    - PaymentStrategy
    - PaymentAdapter
    - Observer (notification)
    - Payment API chạy được

5. Mức tối thiểu:
    - payment luôn success = true
    - chỉ log notification

👉 💥 không cần API thật

---

### 👤 Phong — Leader (QUAN TRỌNG NHẤT)
Pattern:
- Facade Pattern
- Singleton Pattern

Nhiệm vụ:
1. Define:
    - API contract
    - Interface
    - Data model

2. Integrate:
    - Food → Order → Payment

3. Facade:
    - xử lý flow order

4. Review + test


- User(id, name, email, role) // CUSTOMER | STAFF | ADMIN | CHEF
- Food(id, name, price, category, isAvailable)
- Topping(id, name, price, category, isAvailable)
- Order(id, userId, status, item[], createdAt)
- OrderItem(id, foodId, topping[])
- Payment(id, orderId, amount, method, status)
- Notification(id, userId, orderId, title, description, type, createdAt, isSeen)

User 1 --- n Order
Order 1 --- n OrderItem
OrderItem 1 --- n Topping
Order 1 --- 1 Payment

PENDING → CONFIRMED → PREPARING → READY → COMPLETED
                    ↘ CANCELLED

Notification(
  id,
  userId,
  orderId,
  type,
  title,
  message,
  metadata,
  isSeen,
  createdAt
)

Payment.status:
- PENDING
- SUCCESS
- FAILED
- REFUNDED

Order.status:
- CREATED
- CONFIRMED
- PREPARING
- READY
- COMPLETED
- CANCELLED

Notification.type:
- ORDER_CREATED
- PAYMENT_SUCCESS
- ORDER_COMPLETED
- ORDER_CANCELLED