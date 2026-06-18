---
status: pending
created: 2026-06-18
description: Migrate all legacy Animated code to react-native-reanimated for native 120/144fps performance.
---

# Kế hoạch Triển khai: Đại phẫu thuật Animation (Reanimated Migration)

## 🎯 Mục tiêu
- Loại bỏ hoàn toàn sự phụ thuộc vào thư viện `Animated` cũ của React Native.
- Chuyển đổi toàn bộ logic hoạt ảnh (Animation) sang `react-native-reanimated` v3/v4.
- Đưa toàn bộ việc tính toán khung hình từ luồng JavaScript (JS Thread) sang luồng giao diện Native (UI Thread C++).
- Đạt được độ mượt tuyệt đối 120/144fps trên màn hình tần số quét cao mà không bị giật lag (Drop FPS) khi xử lý logic nặng.

---

## 🛠️ Phase 1: Cài đặt và Cấu hình Nền tảng (Infrastructure)
1. **Cài đặt thư viện:** Chạy lệnh cài `react-native-reanimated`.
2. **Cấu hình Babel:** Thêm plugin `react-native-reanimated/plugin` vào `babel.config.js`.
3. **Xóa Cache:** Dọn dẹp toàn bộ Metro cache và build lại Android để JSI C++ được liên kết chính xác.
4. **Trang bị kiểu dữ liệu (Types):** Cập nhật tsconfig nếu cần để hỗ trợ SharedValue.

---

## 🏗️ Phase 2: Nâng cấp Hệ thống Lõi (Core Hooks & Utilities)
Chuyển đổi các logic animation dùng chung sang Reanimated.
1. **`src/common/animations.ts`**: Thay thế các hàm định tuyến easing của RN (`Easing.out`, `Easing.bezier`) sang các hàm chuẩn của Reanimated (`Easing.out`, v.v.).
2. **`src/hooks/useWaterDrop.ts`**: Chuyển `useRef(new Animated.Value(0))` thành `useSharedValue(0)`. Sử dụng `withTiming` thay vì `Animated.timing`.

---

## 🦴 Phase 3: Thay máu Hệ thống Khung xương (Skeletons)
*Đây là thành phần gây sụt FPS nghiêm trọng nhất do chứa nhiều vòng lặp `.start()`.*
1. **`WalletDetailSkeleton.tsx`**
2. **`FilterSkeleton.tsx`**
3. **`AppleSummaryCardSkeleton.tsx`**
4. **`AppleTransactionRowSkeleton.tsx`**
- **Chiến lược:** Viết một hook dùng chung `usePulseAnimation()` sử dụng `withRepeat(withTiming(...))` để tạo hiệu ứng nhịp đập (pulse) chạy vĩnh viễn trên UI Thread mà không làm phiền JS.

---

## 🎨 Phase 4: Chuyển đổi Các Component Giao diện (UI Components & Modals)
1. **`AnimatedOverlay.tsx`**: Chuyển đổi hiệu ứng Fade In/Out mờ nền.
2. **`LiquidButton2.tsx`**: Đổi hiệu ứng `Animated.spring` khi người dùng nhấn (Press) sang `useAnimatedStyle` và `withSpring`.
3. **`ConfirmDialog.tsx` & Các Modal**: Thay hiệu ứng trượt từ dưới lên (Slide Up) và độ mờ (Opacity) bằng hệ thống `Animated.View` của Reanimated.

---

## 📊 Phase 5: Nâng cấp Màn hình Thống kê và Biểu đồ
1. **`AppleTransactionRow.tsx`**: Cập nhật hiệu ứng trượt (Staggered Entrance).
2. **`AppleStatsSummaryCard.tsx`**: Cập nhật hiệu ứng Fade-in.
3. **`AppleBarChart.tsx`**: *Quan trọng!* Các cột biểu đồ (Bars) mọc lên cần dùng `useSharedValue` mảng hoặc thiết lập `delay` bằng `withDelay` của Reanimated để các cột nhô lên mượt mà không bị khựng hình.

---

## ✅ Tiêu chí Nghiệm thu (Acceptance Criteria)
1. Ứng dụng build thành công, không báo lỗi "Reanimated plugin is not configured".
2. Bật FPS Monitor: Khi mở app và cuộn trang hoặc mở màn hình mới, chỉ số FPS phải luôn bám sát con số 120/144, không được rớt xuống dưới 100fps.
3. Xóa sổ hoàn toàn lệnh `import { Animated } from 'react-native'` trong toàn bộ project.
