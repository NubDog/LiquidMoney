# 📘 ĐẶC TẢ KIẾN TRÚC & TIẾN ĐỘ DỰ ÁN: LIQUIDMONEY
> **Dành cho AI và Lập Trình Viên kế nhiệm:** Đọc tài liệu này trước tiên để nắm bắt chính xác hiện trạng hệ thống, công việc đã hoàn thành, các phần còn dang dở và nhiệm vụ cần thực hiện tiếp theo mà không làm sai lệch kiến trúc ứng dụng.

---

## 1. TỔNG QUAN DỰ ÁN & MÔI TRƯỜNG PHÁT TRIỂN
- **Tên dự án:** LiquidMoney (Phiên bản: `0.0.3` / versionCode Android: `7`)
- **Nền tảng mục tiêu duy nhất:** **Android** (Toàn bộ tối ưu hoá, kiểm thử và tính năng đều tập trung 100% cho hệ điều hành Android).
- **Ngôn ngữ & Framework:**
  - React Native `0.84.0` & React `19.2.3`
  - TypeScript `5.8.3` (Toàn bộ code bắt buộc compile sạch qua `npx tsc --noEmit`)
  - Node.js `>= 22.11.0`
- **Phong cách thiết kế:** Kết hợp **Apple Flat Design** và **Liquid Glass (Crystal Clear)** (Xem chi tiết tại [liquid-glass-rules.md](liquid-glass-rules.md)).
  - Màu chữ: 100% `#FFFFFF`.
  - Viền kính: `StyleSheet.hairlineWidth`, màu trắng `rgba(255, 255, 255, 0.3)`.
  - Khối kính lớn/Modal: Bắt buộc `borderBottomWidth: 0` và `borderRightWidth: 0` (Quy tắc Anti-glowing band).
  - Cấm tuyệt đối Handle Bar (thanh gạch ngang kéo) trên đỉnh modal/sheet.

---

## 2. KIẾN TRÚC KỸ THUẬT CỐT LÕI (CORE ARCHITECTURE)

### 2.1. Quản lý State (Zustand v5)
- **Tập tin:** `src/store/useStore.ts`
- **Quy tắc hiệu năng:** Sử dụng `useShallow` khi lấy state trong màn hình để loại bỏ re-render dây chuyền, đảm bảo FPS bám mốc 120/144Hz.
- Quản lý toàn bộ danh sách ví, giao dịch của ví hiện tại, phân trang, chế độ Developer Mode, FPS Monitor, cài đặt hình nền và thời gian hiệu ứng chuyển cảnh (`devAnimations`).

### 2.2. Cơ sở dữ liệu cục bộ (SQLite Native JSI)
- **Tập tin:** `src/database/db.ts` & `src/database/queries.ts`
- **Thư viện:** `react-native-quick-sqlite` (chạy qua C++ JSI direct binding, tốc độ vượt trội so với Bridge).
- **Cấu trúc dữ liệu:**
  - `wallets`: `id (UUID)`, `name`, `initial_balance`, `current_balance`, `image_uri`, `icon`, `created_at`.
  - `transactions`: `id (UUID)`, `wallet_id` (FK cascade delete), `type` (`'IN'` | `'OUT'`), `amount`, `reason`, `image_uri`, `created_at`.
  - `settings`: `key (TEXT PRIMARY KEY)`, `value (TEXT)`.
- **Cơ chế Domino Balance:**
  - Công thức: `current_balance = initial_balance + SUM(IN) - SUM(OUT)`.
  - Mọi thao tác thêm/sửa/xóa giao dịch hoặc đổi số dư đều tự động kích hoạt hàm `recalculateBalance(walletId)` để đảm bảo số liệu nhất quán tuyệt đối.
  - Hỗ trợ chèn giao dịch ngẫu nhiên hàng loạt qua `db.executeBatch()` cho chế độ Dev.

### 2.3. Điều hướng & Hoạt ảnh (Navigation & Reanimated v4)
- **Tập tin:** `src/navigation/AppNavigator.tsx`
- Không sử dụng React Navigation stack nặng nề. Tự triển khai bằng `react-native-reanimated` với container trượt ngang (Horizontal Slide Container) và thanh điều hướng nổi kiểu kính mờ VisionOS (Floating Glass Tab Bar).
- Hỗ trợ vuốt ngang đổi Tab và xử lý nút Back cứng trên Android.
- Màn hình chi tiết ví (`WalletDetailScreen`) trượt vào đè lên trang chủ với kiến trúc 3 tầng: Shell $\rightarrow$ Skeleton (500ms) $\rightarrow$ Payload (FlatList giao dịch).

### 2.4. Dịch vụ hình ảnh & Sao lưu (Services)
- `src/services/imageService.ts`: Sao chép ảnh nền tuỳ biến vào `DocumentDirectoryPath` của ứng dụng, xoá ảnh cũ tránh rò rỉ bộ nhớ.
- `src/services/backupService.ts`: Xuất dữ liệu ra file JSON vào thư mục Downloads của Android và nhập lại bằng `@react-native-documents/picker`.

---

## 3. HIỆN TRẠNG PHÁT TRIỂN (NHỮNG GÌ ĐÃ HOÀN THÀNH)

1. ✅ **Màn hình Ví tiền (`HomeScreen.tsx`):**
   - Hiển thị tổng tài sản Hero view.
   - Thẻ ví phẳng phong cách Apple (`AppleWalletCard.tsx`) hỗ trợ ảnh nền cá nhân hoá tỷ lệ 2.2 với lớp phủ 20% tương phản.
   - Ấn giữ (Long press) để mở modal sửa nhanh số dư và tên ví (`EditWalletModal.tsx`).
   - Nút nổi (FAB) thêm ví mới (`WalletModal.tsx`).
2. ✅ **Màn hình Chi tiết ví (`WalletDetailScreen.tsx`):**
   - Phân trang 12 giao dịch mỗi lần cuộn (`loadMoreTransactions`).
   - Bộ lọc Tất cả / Thu / Chi (`AppleSegmentedControl.tsx`).
   - Xem chi tiết giao dịch (`TransactionDetailOverlay.tsx`), hỗ trợ sửa và xoá với hộp thoại xác nhận chuẩn Apple (`ConfirmDialog.tsx`).
3. ✅ **Màn hình Thống kê (`StatsScreen.tsx`):**
   - Biểu đồ cột SVG Reanimated (`AppleBarChart.tsx`) xem theo Ngày (Hôm nay: Thu vs Chi) và Tuần (7 ngày trong tuần).
   - Tóm tắt tổng thu/chi (`AppleStatsSummaryCard.tsx`) và danh sách 20 giao dịch gần nhất.
4. ✅ **Màn hình Cài đặt (`SettingsScreen.tsx`):**
   - Trạng thái SQLite và react-native-fs.
   - Sao lưu (Export) và Khôi phục (Import) dữ liệu.
   - Bật/tắt chế độ Developer Mode.
5. ✅ **Màn hình Developer (`DeveloperScreen.tsx`):**
   - Sinh ngẫu nhiên ví và hàng trăm giao dịch để stress test hiệu năng.
   - Điều chỉnh tốc độ animation (Slow time animation) để soi lỗi giật hình.
   - Bộ chọn hình nền ứng dụng (`BackgroundPickerModal.tsx`).
   - Bật/tắt Widget FPS Monitor (`FPSMonitor.tsx`).
6. ✅ **Modal Thêm Giao Dịch Nhanh (`QuickTransactionModal.tsx`):**
   - Đã được tái cấu trúc hoàn chỉnh, sử dụng các Apple UI components dùng chung: `WalletDropdownPicker.tsx`, `AppleAmountInput.tsx`, `AppleButton.tsx`, `AppleSegmentedControl.tsx`.
   - Chuẩn bị sẵn sàng làm lõi cho tính năng Quick Add từ Android Widget.

---

## 4. TÍNH NĂNG ĐÃ HOÀN THÀNH: ANDROID HOME SCREEN WIDGET (QUICK TRANSACTION)

### 4.1. Kiến trúc triển khai thực tế
- **Bề mặt Widget (`RemoteViews`):**
  - XML Layout: `android/app/src/main/res/layout/widget_quick_transaction.xml` (thiết kế dạng viên thuốc bo tròn 24dp, nền tối kính mờ `#E61C1C1E`, viền trắng mảnh `#33FFFFFF`, icon tròn `+` và chữ *"Thêm giao dịch"*).
  - XML Provider Info: `android/app/src/main/res/xml/widget_quick_transaction_info.xml`.
  - Class Provider: `QuickTransactionWidgetProvider.kt` (gửi PendingIntent mở `TransparentOverlayActivity`).
- **Activity Nổi Trong Suốt (Native Android):**
  - `TransparentOverlayActivity.kt` kế thừa `ReactActivity`, override `getMainComponentName()` trả về `"QuickWidgetOverlay"`.
  - Theme trong `styles.xml`: `Theme.LiquidMoney.TransparentActivity` (`windowBackground` trong suốt, `windowIsTranslucent = true`, `backgroundDimAmount = 0.45`).
  - Đã loại bỏ hiệu ứng chuyển cảnh window mặc định (`overridePendingTransition(0, 0)`) để hoạt ảnh Reanimated 120Hz trượt lên/xuống mượt mà không bị giật.
- **Màn hình Nổi Độc Lập (React Native):**
  - `src/screens/QuickWidgetScreen.tsx`: bọc bởi `SafeAreaProvider` và `StoreProvider`.
  - Tái sử dụng 100% `QuickTransactionModal.tsx` với cờ `embedded={true}` (không dùng `<Modal>` của RN để tránh lồng Dialog trên cửa sổ trong suốt).
  - Hỗ trợ phím cứng Back trên Android (`hardwareBackPress`) tự động đóng mượt mà.
  - Sau khi lưu hoặc đóng, gọi `WidgetBridge.closeOverlayActivity()` kết thúc Activity.
- **Native Bridge Module:**
  - `WidgetBridgeModule.kt` & `WidgetBridgePackage.kt` cung cấp 2 phương thức:
    - `closeOverlayActivity()`: Đóng Activity overlay native.
    - `updateWidget()`: Gửi broadcast cập nhật widget ngoài màn hình chính khi có giao dịch mới.
- **Đăng ký Component:**
  - `index.js` đã đăng ký: `AppRegistry.registerComponent('QuickWidgetOverlay', () => QuickWidgetScreen);`.

---

## 5. CÁC TỒN ĐỌNG CẦN HOÀN THIỆN TIẾP THEO

1. **Dọn dẹp tàn dư Animated cũ (Reanimated Migration):**
   - Còn 4 tập tin vẫn đang import `Animated` từ `react-native`:
     - `src/screens/StatsScreen.tsx`
     - `src/components/overlays/PopupMenu.tsx`
     - `src/components/layout/BackgroundLiquidGlass.tsx`
     - `src/screens/TransactionDetailScreen.tsx`
   - Cần chuyển đổi nốt sang `react-native-reanimated` theo chuẩn của [2026-06-18-reanimated-migration/plan.md](docs/plans/2026-06-18-reanimated-migration/plan.md).
2. **Tính năng Chuyển tiền giữa các ví (Wallet Transfer):**
   - Đã có state placeholder `toWalletId` trong các modal và icon `Repeat` trong `AppleTransactionRow.tsx`, chưa viết logic chèn 2 giao dịch đồng thời (1 OUT từ ví nguồn, 1 IN vào ví đích).
3. **Mở rộng Widget (Tùy chọn tương lai):**
   - Hiển thị số dư nhanh của Ví mặc định trực tiếp trên mặt Widget (nếu người dùng yêu cầu).

---

## 6. HƯỚNG DẪN KIỂM THỬ WIDGET TRÊN MÁY ẢO / THIẾT BỊ ANDROID

1. **Build và chạy app:**
   ```bash
   npm start
   npm run android
   ```
2. **Thêm Widget ra Desktop:**
   - Ngoài màn hình Home Android, nhấn giữ vào khoảng trống và chọn **Widgets**.
   - Tìm ứng dụng **LiquidMoney**, kéo widget **"Thêm giao dịch nhanh"** ra màn hình chính.
3. **Kiểm thử trải nghiệm:**
   - Chạm vào widget (hoặc nút `+`): Một giao diện pop-up thêm giao dịch dạng Liquid Glass sẽ trượt mượt mà từ đáy màn hình đè lên desktop Android.
   - Nhập số tiền, chọn ví, nhập lý do và bấm **"Thêm giao dịch"** (hoặc chạm ra ngoài vùng tối / bấm nút Back cứng): giao diện sẽ trượt xuống đóng lại và giao dịch được lưu ngay vào SQLite.
   - Mở ứng dụng chính `LiquidMoney`, kiểm tra ví và danh sách giao dịch để thấy số dư và lịch sử đã được cập nhật chính xác.

---
*Tài liệu được cập nhật ngày 03/09/2026 bởi Antigravity AI Assistant.*
