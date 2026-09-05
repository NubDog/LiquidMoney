# 📓 Nhật Ký Phát Triển: LiquidMoney

> Nhật ký ghi chép ngắn gọn, súc tích các thay đổi về kiến trúc, UI/UX và tối ưu hiệu năng của dự án. 

---

## 📅 Tháng 09/2026

### 05/09: Khám Sức Khỏe Dự Án (Codebase Audit) & Dọn Dẹp Mã Nguồn (Clean Housekeeping)
- **Codebase Audit & File Kỷ niệm:** Kiểm tra toàn bộ mã nguồn, bảo tồn 10 file code kỷ niệm theo yêu cầu vào `AGENTS.md` (Quy tắc 10).
- **Chuẩn hóa TransactionDetailScreen:** Chuyển đổi 2 nút thao tác sang `AppleButton` chuẩn Apple UI (hỗ trợ thêm `icon` prop), dọn import thừa.
- **Dọn dẹp HomeScreen:** Loại bỏ `EditWalletModal` và `QuickTransactionModal` không dùng tới, gỡ bỏ ~80 dòng code state/handlers thừa giúp màn hình thanh thoát, giữ nguyên 100% logic kéo thả và giao diện.
- **Tối ưu WalletDetailScreen & StatsScreen:** Dọn các import rác (`LayoutAnimation`, `formatVND`, `Pressable`), chuyển đổi các câu lệnh dynamic `require` database queries sang top-level imports chuẩn mực giúp tăng tốc độ gọi hàm. TypeScript kiểm tra đạt 0 lỗi tuyệt đối.

---

## 📅 Tháng 06/2026

### 01-02/06: Cá Nhân Hóa Ảnh Nền Ví & Tối ưu Trải nghiệm (UI/UX)
- **Tính năng Cá nhân hóa Ảnh nền ví (Mới):**
  - Tích hợp thư viện chọn ảnh Native cho phép tải lên ảnh nền riêng cho từng ví từ `EditWalletModal`.
  - Xây dựng `imageService.ts` quản lý sao lưu ảnh vào vùng nhớ cục bộ vĩnh viễn (`DocumentDirectoryPath`), thu dọn ảnh cũ tự động giúp tối ưu Local Storage, tránh làm phình SQLite Database.
  - Đồng bộ hiển thị ảnh với `resizeMode="cover"` và tỷ lệ chuẩn `2.2` trên các thẻ `AppleWalletCard` và `AppleSummaryCard`.
  - **Tối ưu Tương phản (UX):** Phủ lớp Overlay tối 20% và áp dụng đổ bóng chữ (`textShadow`) giúp số dư và tên ví màu trắng luôn sắc nét trên mọi loại ảnh nền mà không cần phụ thuộc thư viện tính toán màu sắc cồng kềnh.
- **Sửa lỗi Keyboard Avoidance:** Sửa triệt để lỗi bàn phím che Modal trên Android bằng cách đồng bộ `behavior="padding"` cho `EditWalletModal`, `WalletModal`, `TransactionModal`. Bàn phím giờ đây đẩy form lên mượt mà trên cả 2 HĐH.
- **Sửa lỗi Long Press (Ấn giữ):** Fix lỗi không hiển thị menu chỉnh sửa khi ấn giữ thẻ ví ở màn hình chính bằng cách bổ sung `useEffect` để bắt sự kiện hiển thị Modal và đồng bộ dữ liệu ví theo thời gian thực.
- **Đồng bộ Animation 400ms:** Chuẩn hóa toàn bộ thời gian hiệu ứng chuyển cảnh, popup và modal về `400ms` (`Animated.timing` với `Easing.cubic`) để đạt cảm giác phản hồi nhanh, đồng nhất chuẩn Apple. Đổi tỷ lệ `AppleWalletCard` thành `2.2` để thẻ thon gọn hơn.
- **Dọn dẹp Dead Code & Tính năng thừa:** 
  - Xóa bỏ các modal cũ (`ConfirmImportDialog`, `LiquidModal`). Đổi tên `ConfirmDialog2` thành `ConfirmDialog` và cập nhật import toàn dự án.
  - Xóa bỏ file script rác `extract_props.js`.
  - Giữ nguyên `BackgroundPickerModal` cho tương lai.
  - Tổ chức lại state `toWalletId` (tính năng chuyển tiền giữa các ví) thành Placeholder rõ ràng cho các bản cập nhật sau.
- **Sửa lỗi Delay Toàn App (High Priority):** 
  - Khắc phục tình trạng "đơ" hoặc delay 150ms khi bấm vào bất kỳ nút nào (FAB, thẻ ví, dòng giao dịch) bằng cách đặt `delaysContentTouches={false}` trên toàn bộ `FlatList` và `ScrollView` trong app (kèm mã bỏ qua lỗi type của TypeScript).
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
