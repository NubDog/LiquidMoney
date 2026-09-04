# 🤖 QUY TẮC LÀM VIỆC DÀNH CHO AI (AI GUIDELINES)

> **BẮT BUỘC ĐỐI VỚI TẤT CẢ AI:** Trước khi "vibe code" hay thao tác trên dự án này, bạn phải đọc và tuân thủ nghiêm ngặt 9 nguyên tắc sau:

---

### 1. 🚫 KHÔNG TỰ Ý CHẠY LỆNH BUILD DỰ ÁN
- **Tuyệt đối KHÔNG chạy lệnh build dưới bất kỳ hình thức nào** (như `npm run android`, `npx react-native run-android`, `./gradlew build/assemble`, `xcodebuild`...).
- Chỉ được phép chạy lệnh build khi người dùng yêu cầu rõ ràng.

### 2. 🚫 KHÔNG TỰ Ý PUSH HOẶC PULL GIT
- **Tuyệt đối KHÔNG tự ý `git push` hoặc `git pull`** nếu chưa có sự cho phép cụ thể từ người dùng.

### 3. 🧒 TRẢ LỜI CỰC KỲ NGẮN GỌN — TRẺ 5 TUỔI CŨNG HIỂU
- Trả lời ngắn gọn, đi thẳng vào bản chất, không nói vòng vo.
- Dùng từ ngữ đơn giản, gần gũi sao cho một đứa trẻ 5 tuổi đọc cũng hiểu được nội dung bạn muốn truyền tải.

### 4. 🧐 LUÔN NGHI NGỜ VÀ ĐẶT CÂU HỎI CHO MỌI Ý TƯỞNG
- Không vội vàng làm theo ngay mọi yêu cầu, ý tưởng hay phương án mà người dùng đưa ra.
- **Luôn luôn nghi ngờ, phản biện và đặt câu hỏi:**
  - Làm cái này có rủi ro gì không? Có làm hỏng hoặc lag app không?
  - Có thực sự cần thiết không, hay có cách nào đơn giản, thông minh hơn không?

### 5. ♻️ ƯU TIÊN TÁI SỬ DỤNG TÀI NGUYÊN CÓ SẴN
- Luôn ưu tiên dùng lại các tài nguyên đã tạo trong dự án: màu sắc, component (`components/ui/`), bộ hiệu ứng (`common/animations.ts`), theme (`common/theme.ts`)...
- Tuyệt đối không tự tiện viết lại hoặc cài thêm thư viện thừa thãi cho những thứ dự án đã có.

### 6. 🎨 ĐỒNG NHẤT TUYỆT ĐỐI VỀ THIẾT KẾ
- Mọi thành phần UI mới phải đồng nhất chuẩn phong cách Apple & Liquid Glass:
  - Màu sắc, màu nền, màu chữ.
  - Góc bo cong (`Radii`), kích thước và cỡ chữ (`FontSizes`).
  - Viền mỏng tinh tế (`hairlineWidth`), không làm lệch tone giao diện chung.

### 7. 📁 LƯU FILE ĐÚNG NƠI QUY ĐỊNH
- Tuân thủ nghiêm ngặt cấu trúc cây thư mục của dự án:
  - Component giao diện vào `src/components/` (chia đúng nhóm buttons, modals, ui...).
  - Màn hình vào `src/screens/`.
  - Logic/Store vào `src/store/`, database vào `src/database/`...
- Tuyệt đối không tạo file lung tung ngoài luồng hay sai thư mục phân cấp.

### 8. ✨ LUÔN ÁP DỤNG ANIMATION CHO MỌI THAO TÁC (KHÔNG ĐƯỢC GIẬT KHUNG)
- Bất kỳ thành phần nào ẩn đi, hiện lên, mở ra, đóng lại, kéo thả hay di chuyển... **BẮT BUỘC PHẢI CÓ ANIMATION MƯỢT MÀ** (60/120 FPS qua `react-native-reanimated`).
- Tuyệt đối không để phần tử biến mất hay xuất hiện đột ngột giật cục. Khi ẩn thanh menu thì trượt mượt mà xuống, khi hiện lại thì trượt êm ái lên.

### 9. 🗣️ HỎI KỸ, BÁO CÁO RÕ RÀNG TRƯỚC KHI GÕ CODE
- Luôn luôn hỏi đi hỏi lại người dùng để nắm thật chắc, thật rõ những việc cần làm.
- Trước khi bắt tay vào sửa hay viết code, **bắt buộc phải giải thích thật kỹ:**
  - Chuẩn bị làm những gì?
  - Sẽ làm như thế nào và giao diện/trải nghiệm ra sao?
- Đợi người dùng xem xét, gật đầu đồng ý với kế hoạch rồi mới chính thức bắt đầu viết code.


