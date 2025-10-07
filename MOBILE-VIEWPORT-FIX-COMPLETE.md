# Mobile Viewport Fix - Implementation Complete ✅

## Ngày thực hiện: 7 tháng 10, 2025

## Tổng quan
Đã triển khai đầy đủ chiến lược xử lý viewport height cho mobile để khắc phục vấn đề URL bar co-giãn trên iOS Safari, Android Chrome, và Zalo WebView.

---

## 1. ✅ Sửa index.html

### Cập nhật viewport meta tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```
- Thêm `viewport-fit=cover` để hỗ trợ safe areas (tai thỏ, gesture bar)

### Thêm wrapper `.app`
```html
<body>
  <div class="app">
    <!-- Toàn bộ nội dung header / slides-wrapper / loading-screen -->
  </div>
  <script src="script.js"></script>
</body>
```
- Bọc toàn bộ nội dung trong `.app` wrapper để quản lý layout

---

## 2. ✅ Cập nhật style.css

### A. Base Reset & Viewport Strategy (đầu file)
```css
/* ===== Base reset tối thiểu ===== */
html, body { height: 100%; }
body { margin: 0; box-sizing: border-box; -webkit-text-size-adjust: 100%; }
*, *::before, *::after { box-sizing: inherit; }

/* ===== Chiến lược chiều cao an toàn (theo thứ tự ưu tiên) ===== */
/* 0) Fallback cũ */
.app, .screen { min-height: 100vh; }

/* 1) WebKit đời cũ (trước khi có dvh) */
@supports (-webkit-touch-callout: none) {
  .app, .screen { min-height: -webkit-fill-available; }
}

/* 2) Fallback khi chưa có dvh: dùng biến --vh tính bằng JS */
@supports not (min-height: 100dvh) {
  .app, .screen { min-height: calc(var(--vh, 1vh) * 100); }
}

/* 3) Trình duyệt hiện đại: dvh theo visual viewport động */
@supports (min-height: 100dvh) {
  .app, .screen { min-height: 100dvh; }
}

/* ===== Layout ổn định ===== */
.app { 
  display: flex; 
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
  padding-left:   env(safe-area-inset-left);
  padding-right:  env(safe-area-inset-right);
}
.main { flex: 1 1 auto; }

/* Nếu đang dùng header/footer dính mép, ưu tiên sticky thay vì fixed */
.header { position: sticky; top: 0; }
.footer { position: sticky; bottom: 0; }

/* Modal toàn màn (nếu có) – tránh 100vh cứng */
.modal,
.modal__backdrop {
  min-height: 100vh;
}
@supports (min-height: 100dvh) {
  .modal,
  .modal__backdrop { min-height: 100dvh; }
}
.modal__content {
  max-height: 100%;
  overflow: auto;
}

/* Tránh overflow ẩn toàn cục */
html, body { overflow-x: hidden; }
```

### B. Cập nhật tất cả 100vh cứng
Đã thay thế pattern cũ:
```css
/* CŨ - không tối ưu */
height: 100vh;
height: 100dvh;
```

Bằng pattern mới an toàn:
```css
/* MỚI - an toàn với fallback */
height: 100vh;
}
@supports (height: 100dvh) {
  .selector {
    height: 100dvh;
  }
}
```

**Các selectors đã cập nhật:**
- ✅ `html` và `body`
- ✅ `.slides-wrapper`
- ✅ `.slide`
- ✅ `.roadmap-track`
- ✅ `.roadmap-stage`
- ✅ `#clubs`
- ✅ `#jobs`
- ✅ `.loading-screen`

---

## 3. ✅ Thêm JavaScript Fallback (script.js)

Thêm vào đầu file, trước phần IIFE chính:
```javascript
// ===== viewport height fallback cho mobile & WebView =====
(function () {
  const setVh = () => {
    const h = (window.visualViewport?.height || window.innerHeight) * 0.01;
    document.documentElement.style.setProperty('--vh', `${h}px`);
  };
  setVh();

  // Thay đổi chiều cao thực khi xoay máy / URL bar co-giãn / bàn phím
  window.addEventListener('resize', setVh, { passive: true });
  window.addEventListener('orientationchange', setVh, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setVh, { passive: true });
  }
  // iOS Safari khi quay lại từ bfcache
  window.addEventListener('pageshow', (e) => { if (e.persisted) setVh(); }, { passive: true });
})();
```

**Chức năng:**
- Tính toán `--vh` custom property dựa trên visual viewport thực tế
- Tự động cập nhật khi:
  - Xoay màn hình
  - URL bar co-giãn (scroll up/down)
  - Bàn phím hiện/ẩn
  - Quay lại từ bfcache (iOS)

---

## 4. Lợi ích đạt được

### ✅ Tương thích đa nền tảng
- **iOS Safari**: Xử lý URL bar co-giãn mượt mà
- **Android Chrome**: Không bị dôi/thiếu khi scroll
- **Zalo WebView**: Hiển thị đúng chiều cao
- **Desktop**: Không ảnh hưởng trải nghiệm

### ✅ Progressive Enhancement
- Fallback thông minh qua 4 tầng:
  1. `100vh` cơ bản (fallback cuối)
  2. `-webkit-fill-available` (iOS cũ)
  3. `calc(var(--vh) * 100)` (JS calculated)
  4. `100dvh` (modern browsers)

### ✅ Performance
- Sử dụng `{ passive: true }` cho event listeners
- Không block rendering
- Minimal JavaScript overhead

### ✅ Accessibility & Safety
- Hỗ trợ safe areas (notch, gesture bar)
- Không phá vỡ layout khi bàn phím xuất hiện
- Sticky positioning thay vì fixed (giảm jump)

---

## 5. Test Checklist

### Mobile Testing
- [ ] iOS Safari: Cuộn lên/xuống → URL bar co-giãn mượt
- [ ] Android Chrome: Cuộn lên/xuống → không dôi/thiếu
- [ ] Zalo WebView: Mở link → đúng chiều cao
- [ ] Xoay màn hình (portrait ↔ landscape) → tự động adjust
- [ ] Mở bàn phím (form input) → không vỡ layout

### Desktop Testing
- [ ] Chrome/Firefox/Edge: Hoạt động bình thường
- [ ] Không có lỗi console
- [ ] Responsive từ 320px → 4K

### Debug Command (nếu cần)
```javascript
// Paste vào Console để kiểm tra giá trị viewport
console.log({
  dvh: (() => { 
    const p = document.createElement('div'); 
    p.style.cssText='position:fixed;left:-9999px;top:-9999px;height:100dvh;width:1px;'; 
    document.body.appendChild(p); 
    const h=p.getBoundingClientRect().height; 
    p.remove(); 
    return h; 
  })(),
  innerHeight: window.innerHeight,
  visualViewport: window.visualViewport?.height,
  vhVariable: getComputedStyle(document.documentElement).getPropertyValue('--vh')
});
```

---

## 6. Files Changed

| File | Changes | Status |
|------|---------|--------|
| `index.html` | ✅ Updated viewport meta<br>✅ Added `.app` wrapper | ✅ Complete |
| `style.css` | ✅ Added base reset<br>✅ Added viewport strategy<br>✅ Updated all 100vh → dvh pattern | ✅ Complete |
| `script.js` | ✅ Added viewport height fallback IIFE | ✅ Complete |

---

## 7. Maintenance Notes

### Khi thêm component mới
- Sử dụng pattern `@supports (height: 100dvh)` cho chiều cao full
- Tránh `height: 100vh` cứng
- Kiểm tra trên mobile trước khi commit

### Nếu gặp vấn đề
1. Kiểm tra Console có lỗi không
2. Chạy debug command ở trên
3. Verify `.app` wrapper tồn tại
4. Kiểm tra `--vh` variable được set

---

**✅ Implementation Complete!**  
Tất cả thay đổi đã được áp dụng và code đã sẵn sàng để test trên thiết bị thực.
