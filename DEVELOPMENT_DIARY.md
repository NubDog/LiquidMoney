# 📓 Nhật Ký Phát Triển: LiquidMoney

> Nhật ký ghi chép ngắn gọn, súc tích các thay đổi về kiến trúc, UI/UX và tối ưu hiệu năng của dự án. 

---

## 📅 Tháng 06/2026

### 01-02/06: Tối ưu Bàn phím, Animation & Dọn dẹp Code Thừa
- **Sửa lỗi Keyboard Avoidance:** Sửa triệt để lỗi bàn phím che Modal trên Android bằng cách đồng bộ `behavior="padding"` cho `EditWalletModal`, `WalletModal`, `TransactionModal`. Bàn phím giờ đây đẩy form lên mượt mà trên cả 2 HĐH.
- **Sửa lỗi Long Press (Ấn giữ):** Fix lỗi không hiển thị menu chỉnh sửa khi ấn giữ thẻ ví ở màn hình chính bằng cách bổ sung `useEffect` để bắt sự kiện hiển thị Modal và đồng bộ dữ liệu ví theo thời gian thực.
- **Đồng bộ Animation 400ms:** Chuẩn hóa toàn bộ thời gian hiệu ứng chuyển cảnh, popup và modal về `400ms` (`Animated.timing` với `Easing.cubic`) để đạt cảm giác phản hồi nhanh, đồng nhất chuẩn Apple. Đổi tỷ lệ `AppleWalletCard` thành `2.2` để thẻ thon gọn hơn.
- **Dọn dẹp Dead Code & Tính năng thừa:** 
  - Vô hiệu hóa thư viện `react-native-image-picker` và code xử lý ảnh Base64 trong `backupService.ts`.
  - Xóa bỏ các modal cũ (`ConfirmImportDialog`, `LiquidModal`). Đổi tên `ConfirmDialog2` thành `ConfirmDialog` và cập nhật import toàn dự án.
  - Xóa bỏ file script rác `extract_props.js`.
  - Giữ nguyên `BackgroundPickerModal` cho tương lai.
  - Tổ chức lại state `toWalletId` (tính năng chuyển tiền giữa các ví) thành Placeholder rõ ràng cho các bản cập nhật sau.
- **Sửa lỗi Delay Toàn App (High Priority):** 
  - Khắc phục tình trạng "đơ" hoặc delay 150ms khi bấm vào bất kỳ nút nào (FAB, thẻ ví, dòng giao dịch) bằng cách tắt mặc định `delaysContentTouches={false}` trên toàn bộ `FlatList` và `ScrollView` trong app.
  - Trì hoãn việc render danh sách giao dịch nặng trong `WalletDetailScreen` cho đến khi hiệu ứng trượt 400ms kết thúc, giải phóng JS Thread và giúp thao tác chạm mượt mà tức thời.

---

## 📅 Tháng 05/2026

### 18-21/05: Hoàn thiện Apple UI & Tối ưu Render (120FPS)
- **Kiến trúc State mới (Zustand):** Hoàn tất chuyển đổi từ React Context sang **Zustand v5** để ngăn chặn re-render dây chuyền, loại bỏ tình trạng giật lag màn hình (stuttering). Đảm bảo app chạy mượt ở 60/120 FPS.
- **Tối ưu Form Nhập Liệu:** Chuyển đổi cách xử lý animation đẩy màn hình thủ công sang dùng `KeyboardAvoidingView` kết hợp `ScrollView` nguyên bản để tránh lỗi hiển thị khi nội dung quá dài.

### 10-14/05: Phân trang & Tối ưu Trải nghiệm Giao dịch
- **Phân trang dữ liệu:** Áp dụng load 12 giao dịch mỗi lần cuộn để tối ưu SQLite Database, kết hợp với animation render thẻ từ trên xuống dưới ở tốc độ 120 FPS.
- **Skeleton Loading:** Thêm hiệu ứng loading 500ms (Skeleton) vào `WalletDetailScreen` để tạo cảm giác load data tự nhiên hơn trước khi hiển thị số liệu thật.
- **Sửa lỗi "Black Box" Android:** Khắc phục triệt để lỗi bóng đen phần cứng do xung đột giữa thuộc tính `BlurView` và shadow trên thiết bị Android.

---

## 📅 Tháng 04/2026

### 24-28/04: Chuyển đổi "Liquid Glass" ➔ "Apple Flat Design"
- **Đại tu Màn hình Cài đặt (Settings):** Gỡ bỏ hoàn toàn các hiệu ứng kính mờ (Liquid Glass) nặng nề. Áp dụng phong cách thiết kế phẳng (Flat iOS-style) với 2-3 màu chủ đạo, giảm bớt icon màu mè thừa thãi, căn chỉnh lại không gian để tạo sự chuyên nghiệp.
- **Chuẩn hóa Dialog:** Refactor các cảnh báo (xóa ví, import dữ liệu) sang Component `ConfirmDialog` mới với ngôn ngữ thiết kế đồng nhất.
