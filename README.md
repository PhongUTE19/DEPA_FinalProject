# Online Food Ordering Website

Web app dùng Node.js + Express + Handlebars + Supabase để đặt món ăn đơn giản, dễ mở rộng.

## Tính Năng
- Xem menu, chọn món, tùy chỉnh topping
- Tạo đơn hàng, cập nhật trạng thái
- Thanh toán (mô phỏng), thông báo cơ bản

## Công Nghệ
- Node.js 18, Express 5
- Handlebars (SSR)
- PostgreSQL qua Knex (Supabase)

## Cấu Trúc Thư Mục
- `app.js` — entry point
- `controllers/` — nhận request, trả response
- `services/` — business logic (áp dụng design patterns)
- `routes/` — định nghĩa API
- `middlewares/`, `helpers/`, `config/`
- `views/` (layouts, pages, partials), `public/` (css, imgs)

## Design Patterns Sử Dụng
- Factory Method (tạo Food, Payment, Notification)
- Strategy (xử lý thanh toán, pricing, discount)
- Observer (thông báo thay đổi trạng thái, thanh toán)
- Decorator (topping), Builder (Order), State (Order status)
- Facade (flow Order), Adapter (chuẩn hóa cổng thanh toán), Singleton (config/DB)

## API Chính (rút gọn)
- `GET /menu` — danh sách món
- `POST /order` — tạo đơn hàng
- `PATCH /order/status` — cập nhật trạng thái
- `POST /payment` — thanh toán đơn hàng

## Chạy Dự Án
1) Cài Node 18.x
2) Cài gói: `npm i`
3) Chạy dev: `npm run dev` (hoặc `npm start`)

Tuỳ dự án có thể cần biến môi trường (ví dụ Supabase). Tạo file `.env` nếu cần.

---

Tài liệu nội bộ (quy trình Git, phân công nhân sự, checklist) đã được lược bỏ để README gọn, tập trung cho người dùng dự án.
