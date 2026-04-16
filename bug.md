# Báo Cáo Lỗi

---

## 1. Thông báo thêm món yêu thích thành công (High)

**URL:** http://localhost:3000/menu

**Mô tả:** Khi người dùng đã đăng nhập, nút yêu thích chưa có thông báo hoặc sự thay đổi khi bấm.

---

## 2. Tên người dùng trong bình luận (High)

**URL:** http://localhost:3000/menu

**Mô tả:** Bình luận chỉ hiện id, chưa hiện tên người dùng.

---

## 3. Giá tiền yêu thích (Low)

**URL:** http://localhost:3000/favorite

**Mô tả:** Giá trị món ăn và đơn vị tiền tệ bị sai (ví dụ: hiển thị `75000.00k` thay vì `75.000đ`).

---

## 4. Xóa món yêu thích (Low)

**URL:** http://localhost:3000/favorite

**Mô tả:** Khi bấm nút xóa khỏi yêu thích, kết quả danh sách mới chỉ xuất hiện khi thủ công tải lại trang.

---

## 5. Thêm Topping (High)

**URL:** http://localhost:3000/menu

**Mô tả:** Các nút topping chưa có tác dụng (chọn topping không ảnh hưởng đến tổng cộng hoặc đơn hàng).

---

## 6. Thông báo cart (Low)

**URL:** http://localhost:3000/menu

**Mô tả:** Khi giỏ hàng chưa có hàng, người dùng thêm món ăn vào giỏ hàng thì vẫn chưa hiển thị số món hàng cho tới khi thủ công tải lại trang.

---

## 7. Thông báo thêm vào giỏ (Medium)

**URL:** http://localhost:3000/menu

**Mô tả:** Thêm món ăn vào giỏ hàng thì luôn hiện thông báo lỗi: `Cannot read properties of null (reading 'name')`.

---

## 8. Xóa giỏ hàng hiện tại (Medium)

**URL:** http://localhost:3000/cart

**Mô tả:** Nút "Xóa giỏ hàng" chưa hoạt động.

---

## 9. Thanh toán hiển thị thiếu (High)

**URL:** http://localhost:3000/cart → http://localhost:3000/payment/:id

**Mô tả:** Bấm nút "Đặt hàng & thanh toán" sẽ dẫn tới màn hình thanh toán, nhưng màn hình thanh toán còn thiếu nhiều thông tin (Tạm tính hiển thị `0đ`, Tổng thanh toán hiển thị `0đ`).

---

## 10. Thanh toán chưa được tiện lợi (High)

**URL:** http://localhost:3000/payment/:id

**Mô tả:**
- Chưa coi lại được các món ăn bên trong đơn hàng.
- Hiển thị tất cả coupon thay vì nhập coupon còn thủ công.

---

## 11. Tạo đơn hàng dù chưa thanh toán (High)

**URL:** http://localhost:3000/cart → http://localhost:3000/order

**Mô tả:** Khi bấm "Đặt hàng & thanh toán" sẽ luôn xóa toàn bộ món trong cart và tạo đơn hàng dù chưa thanh toán.

---

## 12. Xem đơn hàng chi tiết còn thiếu (High)

**URL:** http://localhost:3000/payment/history

**Mô tả:** Chưa coi lại được các món ăn bên trong đơn hàng khi xem lịch sử thanh toán.

---

## 13. Trùng mục đích: danh sách đơn hàng (High)

**URL:** http://localhost:3000/order và http://localhost:3000/payment/history

**Mô tả:** Hai trang có mục đích trùng lặp — cả hai đều liệt kê đơn hàng của người dùng nhưng hiển thị theo cách khác nhau (một trang là "Đơn hàng", một trang là "Lịch sử thanh toán"), gây nhầm lẫn cho người dùng.

---

## Tóm tắt theo mức độ ưu tiên

| Mức độ | Số lượng | Các lỗi |
|--------|----------|---------|
| High   | 8        | #1, #2, #5, #9, #10, #11, #12, #13 |
| Medium | 2        | #7, #8 |
| Low    | 3        | #3, #4, #6 |