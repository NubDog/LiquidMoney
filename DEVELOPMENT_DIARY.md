# LIQUID MONEY - NHẬT KÝ PHÁT TRIỂN (DEVELOPMENT DIARY)
*Ghi chép lại hành trình từ ý tưởng ban đầu đến một ứng dụng tài chính tinh gọn, hiện đại.*

---

## 1. Khởi nguồn ý tưởng: Kỷ nguyên của "Liquid Glass"
Những ngày đầu tiên phát triển LiquidMoney, định hướng thiết kế (Design Language) mà chúng ta theo đuổi là **"Liquid Glass"** (Kính lỏng) - một phong cách UI cực kỳ bóng bẩy, chân thực với chiều sâu 3D, sự tán xạ ánh sáng và độ trong suốt phức tạp. 
- Chúng ta đã dành hàng giờ để tinh chỉnh từng hiệu ứng sáng tối (glow), đổ bóng dựa trên "Tỷ lệ vàng" (Golden Ratio).
- Các component như `LiquidButton2`, `TransactionRow2`, `EmptyState2` ra đời với mong muốn mang lại một cảm giác "chạm vào kính" thực sự.

**Khó khăn gặp phải:**
Đẹp luôn đi kèm với cái giá của nó. Việc nhồi nhét quá nhiều thẻ `<Svg>`, `RadialGradient` và `<BlurView>` lồng nhau đã dẫn đến:
- Lỗi kết xuất (rendering artifacts) đặc biệt nghiêm trọng trên hệ điều hành Android.
- Hiện tượng "Double-blur" (nhòe kép) và "Halo effect" (phát quang viền chữ) khi các lớp kính đè lên nhau.
- Hiệu năng (Performance) bị ảnh hưởng khi có quá nhiều view phức tạp cần tính toán mỗi khung hình.

**Cách giải quyết của chúng ta:**
Chúng ta đã phải lặn lội tìm hiểu sâu vào cơ chế kết xuất của `BlurView` trên Android (sử dụng ViewTreeObserver), từ đó chuẩn hóa lại toàn bộ kiến trúc. Chúng ta gom tất cả hiệu ứng kính vào một component duy nhất là `BackgroundLiquidGlass` để tái sử dụng và kiểm soát lỗi.

---

## 2. Bước ngoặt thiết kế: Sự chuyển mình sang "Apple Flat Design"
Sau một thời gian vật lộn với các hiệu ứng kính mờ và nhận thấy UI bắt đầu trở nên "nặng nề", rườm rà, một quyết định mang tính bước ngoặt đã được đưa ra: **Đập bỏ sự rườm rà, tiến tới sự tối giản.**

Chúng ta quyết định "Apple hóa" ứng dụng:
- Bỏ đi lớp kính mờ đục, thay bằng nền đen phẳng (`#000000`) và các thẻ (Cards) xám nhám (`#1C1C1E`) theo chuẩn Inset Grouped của iOS.
- Các icon màu sắc lòe loẹt bị loại bỏ, thay bằng màu trung tính (`Colors.textMuted`).
- Xây dựng lại toàn bộ bộ thư viện component mới: `AppleButton`, `AppleTextInput`, `AppleCloseButton` và đặc biệt là `AppleGlassBackground`.

**Hành trình "Đại tu":**
- **Settings Screen & Developer Screen**: Đập đi xây lại hoàn toàn. Giao diện trở nên sắc nét, chuyên nghiệp và có độ tập trung cực cao.
- **Wallet Modal & Stats Screen**: Lược bỏ kính lỏng, sử dụng Chrome Material nhẹ nhàng hơn, thêm giới hạn hiển thị "8 chữ số" cho số dư để chống vỡ Layout.
- **Terminal Log Modal**: Từ một khối kính nặng nề trở thành một cửa sổ Console chân thực mang đậm chất hacker với font `monospace` và hệ thống tự động đổi màu text (Syntax Highlighting) theo chuẩn log lỗi (Đỏ), thành công (Xanh).

---

## 3. Những con Bug "để đời" và Quá trình gỡ lỗi (Debugging)

Trong quá trình thay máu ứng dụng, chúng ta đã đụng phải những con bug cực kỳ hóc búa mang tính chất hệ thống:

1. **Lỗi lệch dòng Log trong Terminal:**
   - *Triệu chứng*: Khi in log ra màn hình, chữ bị rớt xuống dưới hàng chứa số thứ tự `[000x]`.
   - *Nguyên nhân*: Các ký tự xuống dòng `\n` ẩn giấu bên trong chuỗi log sinh ra từ hàm tự động.
   - *Giải quyết*: Viết logic ngầm `.startsWith('\n')` và `.trim()` tại Component hiển thị, đồng thời bù lại bằng `marginTop` để giữ đúng ý đồ khoảng cách của người viết code mà layout vẫn thẳng hàng.

2. **Lỗi TypeScript `onLayout`:**
   - *Triệu chứng*: Type báo lỗi đỏ lòm khi cố truyền `onLayout` vào `AppleGlassBackground`.
   - *Giải quyết*: Mở rộng Interface của `AppleGlassBackgroundProps` để kế thừa sức mạnh tính toán tọa độ gốc của React Native, từ đó giúp `LiquidSegmentedControl2` đo đạc kích thước chính xác.

3. **Hiện tượng "Bóng ma vạch trắng" (Subpixel Bleeding):**
   - *Triệu chứng*: Khi nút bấm trượt (Water Drop Animation) chạy hiệu ứng co giãn, ở viền xuất hiện chớp nhoáng các vạch trắng ngang.
   - *Nguyên nhân*: GPU tính toán sai số khử răng cưa (anti-aliasing) khi phải liên tục `scaleX` một hình có độ bo góc cực lớn (`borderRadius: 9999`).
   - *Giải quyết*: Ép GPU gom lớp thành ảnh tĩnh bằng `renderToHardwareTextureAndroid={true}`, bọc `overflow: 'hidden'` và gắn một cái viền ảo `hairlineWidth` trong suốt. Một giải pháp cực kỳ "Native" để trị bệnh của hệ điều hành.

---

## 4. Tối ưu hóa Trải nghiệm Người dùng (UX) & Hiệu năng (Performance)

Tiếp nối việc thay đổi ngôn ngữ thiết kế, giai đoạn gần đây tập trung mạnh mẽ vào việc chuốt lại các tương tác (micro-interactions) và tính khả dụng của ứng dụng:

1. **Xử lý triệt để vấn đề Bàn phím (Keyboard UX):**
   - *Vấn đề*: Trong các Transaction Modals, khi người dùng nhập số tiền hoặc ghi chú, bàn phím (đặc biệt trên iOS) thường xuyên trồi lên che khuất luôn ô input (nhập liệu).
   - *Giải pháp*: Xây dựng lại cơ chế tương tác với bàn phím (Keyboard push/avoid). Đảm bảo form nhập liệu luôn linh hoạt cuộn hoặc đẩy lên trên vùng an toàn (safe area), giữ cho Input luôn nằm trong tầm nhìn để luồng thao tác không bị đứt đoạn.

2. **Chinh phục giới hạn 120fps cho Animation:**
   - Để các Dialog/Modal (như `ConfirmImportDialog2`) có cảm giác "cao cấp", các hiệu ứng xuất hiện (entrance) và biến mất (exit) đã được tinh chỉnh lại bằng các hàm nội suy Cubic-easing đặc biệt.
   - Các chuyển động giờ đây không chỉ mượt mà, không bị khựng (drop frame) mà còn đảm bảo duy trì ổn định ở mức 120fps trên các thiết bị phần cứng hỗ trợ. Mọi thao tác vuốt, chạm đều đem lại phản hồi tức thì và tự nhiên.

3. **Hoàn thiện hệ sinh thái "Liquid Glass Modals":**
   - Dù xu hướng thiết kế đã phẳng hóa ở nhiều nơi, các lớp Overlay đè lên màn hình (như Modal Background) vẫn cần chiều sâu.
   - Bổ sung biến thể `modal` cho `BackgroundLiquidGlass` (tối hơn, đậm đặc hơn) thay vì một màu đen đặc. Đồng thời xây dựng logic chống nhòe kép (nesting logic) để xử lý dứt điểm các lỗi "double-blur" (nhòe chồng lên nhau) khi các Component giao diện lồng ghép phức tạp.

---

## 5. Tầm nhìn & Tổng kết
Hành trình của **LiquidMoney** không chỉ là việc code ra một cái app quản lý chi tiêu. Đó là hành trình của sự **Trưởng thành trong tư duy sản phẩm**:
- Đi từ **"Sự phô trương kỹ thuật"** (nhồi nhét hiệu ứng bóng bẩy, phức tạp).
- Đến **"Sự thấu hiểu người dùng"** (đặt hiệu năng, sự rõ ràng, dễ nhìn và trải nghiệm mượt mà lên hàng đầu).

Mọi quyết định thiết kế giờ đây đều được cân nhắc kỹ càng: *Liệu nó có cần thiết không? Liệu nó có đủ phẳng và sạch sẽ không? Liệu nó có chuẩn native không?* 

LiquidMoney đang dần lột xác từ một nguyên mẫu thử nghiệm đầy tính nghệ thuật thành một sản phẩm thực thụ, vững chãi và chuyên nghiệp.

> *"Đơn giản là đỉnh cao của sự tinh tế."*
