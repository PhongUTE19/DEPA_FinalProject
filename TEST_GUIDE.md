# Test Guide - Payment & Notification System

## **1. Chuẩn bị**

### Start Server
```bash
npm install
npm run dev
```
Server sẽ chạy tại: `http://localhost:3000`

---

## **2. Test Payment (Strategy + Adapter Pattern)**

### **A. Tạo đơn hàng (Order)**

Giả sử có order trong database với:
- `orderId = "order-123"`
- `total_amount = 150000`

### **B. Test 3 Phương thức thanh toán**

#### **1️⃣ Thanh toán bằng CASH (Tiền mặt)**

```bash
curl -X POST http://localhost:3000/payment/api \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-123",
    "paymentMethod": "cash",
    "totalAmount": 150000,
    "userId": 1
  }'
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": 1,
    "order_id": "order-123",
    "method": "cash",
    "amount": 150000,
    "transaction_id": "CASH-1711755630000-order-123",
    "status": "success"
  }
}
```

---

#### **2️⃣ Thanh toán bằng BANK (Chuyển khoản)**

```bash
curl -X POST http://localhost:3000/payment/api \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-456",
    "paymentMethod": "bank",
    "totalAmount": 200000,
    "userId": 2
  }'
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "method": "bank",
    "transaction_id": "BANK-1711755630000-order-456",
    "amount": 200000
  }
}
```

---

#### **3️⃣ Thanh toán bằng MOMO (Ví điện tử)**

```bash
curl -X POST http://localhost:3000/payment/api \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-789",
    "paymentMethod": "momo",
    "totalAmount": 300000,
    "userId": 3
  }'
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "method": "momo",
    "transaction_id": "MOMO-1711755630000-order-789",
    "amount": 300000
  }
}
```

---

## **3. Test Notification (Observer Pattern)**

### **Khi thanh toán, tự động tạo 2 notifications:**

1. **UserNotifier** → Lưu vào DB với `type: 'user'`
2. **KitchenNotifier** → Lưu vào DB với `type: 'kitchen'`

### **A. Xem thông báo của User**

```bash
curl -X GET "http://localhost:3000/notification?userId=1"
```

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "user_id": 1,
      "order_id": "order-123",
      "type": "user",
      "event": "ORDER_PAID",
      "message": "Thanh toán đơn hàng #order-123 thành công. Mã GD: CASH-1711755630000-order-123",
      "is_read": false,
      "created_at": "2026-03-29T10:00:00Z"
    }
  ],
  "unread": 1
}
```

---

### **B. Xem thông báo Bếp**

```bash
curl -X GET http://localhost:3000/notification/kitchen
```

**Response:**
```json
{
  "notifications": [
    {
      "id": 2,
      "order_id": "order-123",
      "type": "kitchen",
      "event": "ORDER_PAID",
      "message": "Đơn hàng #order-123 đã thanh toán – BẢT ĐẦU CHỈ BIẾN!",
      "is_read": false
    }
  ]
}
```

---

### **C. Mark notification as read**

```bash
curl -X PATCH http://localhost:3000/notification/1/read \
  -H "Content-Type: application/json"
```

---

### **D. Mark all as read**

```bash
curl -X PATCH http://localhost:3000/notification/read-all \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

---

## **4. Verify Database**

### **Query 1: Check payments table**
```sql
SELECT * FROM payments ORDER BY created_at DESC;
```

Expected:
- `transaction_id` khác nhau tùy `paymentMethod`
- `status = 'success'`
- `method = 'cash' | 'bank' | 'momo'`

---

### **Query 2: Check notifications table**
```sql
SELECT * FROM notifications ORDER BY created_at DESC;
```

Expected:
- Có 2 rows per payment (user + kitchen)
- `type = 'user' | 'kitchen'`
- `event = 'ORDER_PAID'`
- `is_read = false/true`

---

## **5. Test Flow**

### **Full Payment → Notification Flow:**

```
1. POST /payment/api (cash) 
   ↓
2. PaymentAdapter.process() 
   ↓
3. CashPaymentStrategy.pay()  ← Strategy Pattern
   ↓
4. PaymentModel.create()  
   ↓
5. orderSubject.notify('ORDER_PAID', ...)
   ↓
6. UserNotifier.update() + KitchenNotifier.update()  ← Observer Pattern
   ↓
7. NotificationModel.create() × 2
   ↓
✅ Payment + 2 Notifications saved to DB
```

---

## **6. Using PowerShell (Windows)**

### **Test Cash Payment**
```powershell
$body = @{
    orderId = "order-123"
    paymentMethod = "cash"
    totalAmount = 150000
    userId = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/payment/api" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### **Test Bank Payment**
```powershell
$body = @{
    orderId = "order-456"
    paymentMethod = "bank"
    totalAmount = 200000
    userId = 2
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/payment/api" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

## **7. Check Logs**

Server sẽ print:
```
[OrderSubject] Notifying event: ORDER_PAID
[UserNotifier] Thanh toán đơn hàng #order-123 thành công...
[KitchenNotifier] 🍳 Đơn hàng #order-123 đã thanh toán – BẢT ĐẦU CHỈ BIẾN!
```

---

## **Summary**

✅ **3 Phương thức thanh toán** (Strategy)  
✅ **Chuẩn hóa input/output** (Adapter)  
✅ **Tự động gửi notifications** (Observer)  
✅ **Lưu vào DB** (Models)

Ready to demo! 🎯
