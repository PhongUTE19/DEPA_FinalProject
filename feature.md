# Thêm tính năng

---

## 1. Nếu User có role là Staff

**URL:** http://localhost:3000/staff

**Mô tả:**
Staff có thể thay đổi trạng thái đơn hàng order PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED

Sau khi đăng nhập thành công
Thanh điều hướng của có thêm nút:
+ nút quản lý đơn hàng: khi bấm sẽ hiển thị danh sách toàn bộ đơn hàng. Danh sách có nút thay đổi trạng thái của đơn hàng

---

## 2. Nếu User có role là Manager

**URL:** http://localhost:3000/manager

**Mô tả:** 
Manager có thể làm bất kỳ việc của Staff nhưng có thêm khả năng: 
+ quản lý món ăn
+ quản lý nhân viên

Sau khi đăng nhập thành công
Thanh điều hướng của có thêm nút:
+ nút quản lý món ăn: Khi bấm sẽ hiển thị danh sách toàn bộ món ăn. Danh sách có nút thêm, xóa, sửa món ăn vào danh sách
+ nút quản lý nhân viên: Khi bấm sẽ hiển thị danh sách toàn bộ nhân viên. Danh sách có nút thêm, xóa, sửa nhân viên vào danh sách

---

## 3. Hoàn thiện landing page

**URL:** http://localhost:3000/

**Mô tả:** Thêm một số món ăn
+nổi bật
+mua nhiều nhất
+mới

Có thể tham khảo và chỉnh sửa lại các file này 
+ views/partials/course-card.hbs
+ views/partials/course-section.hbs

---

## 4. Áp dụng Design Pattern Singleton

**Mô tả:**
Áp dụng Design Pattern Singleton cho một hoặc một số nơi cần thiết

---
