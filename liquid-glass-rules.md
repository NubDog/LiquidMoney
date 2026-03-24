# Hệ Thống Thiết Kế Liquid Glass (Crystal Clear)

Nguyên tắc thiết kế Liquid Glass hoàn toàn trong trẻo, tinh khiết như pha lê do người dùng chỉ định. Áp dụng cho mọi component trong tương lai (Button, Card, Modal, Overlay) trên cả môi trường iOS và Android.

## 1. Nguyên lý kết hợp nền và độ mờ (Blur Core Physics)
*   **KHÔNG sử dụng `blurType="dark"` hay `blurType="regular"`** một cách bừa bãi. Trên Android, các loại blur này (hoặc `light` mặc định) thường tự động ép thêm một lớp trắng/xám đục lờ mờ (muddy overlay) làm hỏng độ trong của kính.
*   **Công thức gốc (Golden Formula):**
    ```tsx
    // Bắt buộc phải có @ts-ignore cho overlayColor="transparent" trên Android
    {/* @ts-ignore: overlayColor fixes Android native tinting */}
    <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={10-25} // Tuỳ kích thước (nhỏ dùng 10-15, to dùng 20-25)
        overlayColor="transparent"
        reducedTransparencyFallbackColor="transparent"
    />
    ```
*   **Tránh chồng chéo Blur (Blur Stacking):** Nếu một đối tượng Glass được đặt trên một nền đã bị Blur trước đó (ví dụ Button nằm trong Modal), việc dùng BlurView quá mạnh sẽ gây ra lỗi gộp đục. Phải bóp `blurAmount` xuống mức thấp nhất hoặc dùng nền bán trong suốt (translucent solid).

## 2. Màu sắc và Vùng phủ (Overlay Fill)
Để quy định kính là kính sáng (light glass) hay kính râm (dark glass), ta KHÔNG dùng cấu hình của BlurView, mà dùng một lớp phủ `<View>` nằm đè ngay trên lớp `BlurView`:
*   **Xuyên thấu, sáng nhẹ (Glass Button):** `backgroundColor: 'rgba(255, 255, 255, 0.05)'` đến `0.15`.
*   **Kính râm nhẹ (Glass Card/Modal):** `backgroundColor: 'rgba(0, 0, 0, 0.15)'` đến `0.25`.
*   Tuyệt đối không dùng các màu đặc như `rgba(255,255,255,0.4)` vì nó làm kính trông như bị tráng nhựa.

## 3. Viền tinh xảo (Crisp Edges & Edge Lighting)
Cắt cạnh của kính phải cực kỳ sắc sảo để tạo độ "bén" của pha lê:
*   Độ dày viền (Border Width): LUÔN LUÔN dùng `StyleSheet.hairlineWidth`. Tuyệt đối không dùng `1.5` hay `2`, nó khiến giao diện bị nặng nề và "rẻ tiền".
*   Màu viền (Border Color): Độ sáng màu trắng `rgba(255, 255, 255, 0.3)` để lấy ánh sáng hắt vào nếp cắt của kính. Không dùng đổ bóng (shadow) mờ cho text hay viền kính.
*   **QUY TẮC BẮT BUỘC (ANTI-GLOWING BAND):** Đối với các khối kính lớn (LiquidCard, Modal, BottomSheet), ánh sáng môi trường giả lập chỉ chiếu từ góc trên bên trái xuống. Do đó, phải **LUÔN LUÔN set `borderBottomWidth: 0` và `borderRightWidth: 0`**. 
    * Nếu bạn để viền kính bao quanh toàn bộ các cạnh, mép dưới màn hình sẽ xuất hiện một "dải sáng màu trắng cực kỳ vô duyên" mỗi khi Modal/Submenu trượt lên và ẩn đi. Thiết kế Liquid Glass xịn tuyệt đối cấm hiệu ứng viền đáy này.

## 4. Typography (Chữ & Icons)
*   Màu chữ và icon 100% là `#FFFFFF`, loại bỏ toàn bộ `textShadow` trên text để tránh lỗi hiệu ứng 3D quê mùa.
*   Nên dùng phông chữ Weight từ `500` - `600`, tracking hơi sát.

## 5. Cấm sử dụng Handle Bar (Thanh kéo)
*   **QUY TẮC BẮT BUỘC:** Tuyệt đối KHÔNG DÙNG thanh kéo (handle bar có hình dạng một đường gạch ngang bo tròn - `width: 44, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.4)'`) trên đỉnh của các Modal, Bottom Sheet hay Submenu.
*   Hiệu ứng thanh kéo này sẽ tạo thành một "dải sáng màu trắng" chói lóa, nổi bần bật cắt ngang và phá hỏng độ trong trẻo tinh khiết của material Liquid Glass. Sự tinh giản và đồng nhất của kính tự nó đã báo hiệu vùng có thể trượt mà không cần vẽ thêm vạch màu.

Bằng cách tuân theo các quy tắc này, ứng dụng sẽ có bộ UI Glassmorphism cực kỳ cao cấp, trong trẻo như thuỷ tinh thật trên cả 2 nền tảng Android/iOS.
