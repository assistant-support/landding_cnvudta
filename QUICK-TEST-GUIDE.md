# 🧪 QUICK TEST GUIDE

## ⚡ TESTING CHECKLIST (5 PHÚT)

### ✅ Test 1: Chrome DevTools (Desktop)
```bash
1. Mở Chrome → F12
2. Ctrl+Shift+M (Toggle Device Mode)
3. Chọn "iPhone 12 Pro"
4. Refresh page
5. Scroll từ trên xuống dưới
6. Kiểm tra: ❌ Không có gap trắng ở bottom
```

### ✅ Test 2: Chrome Android (Real Device) ⭐
```bash
1. Mở Chrome trên Android
2. Truy cập website
3. Scroll lên → Address bar ẩn
4. Scroll xuống → Address bar hiện
5. Kiểm tra: ❌ Không overflow, không gap
6. Rotate thiết bị portrait ↔ landscape
7. Kiểm tra: ✅ Layout vẫn ổn định
```

### ✅ Test 3: Safari iOS (Real Device) ⭐⭐⭐
```bash
1. Mở Safari trên iPhone (KHÔNG PHẢI Chrome iOS)
2. Truy cập website
3. Scroll lên/xuống nhiều lần
4. Kiểm tra: ❌ Không có gap trắng
5. Rotate portrait ↔ landscape
6. Mở keyboard → Dismiss keyboard
7. Kiểm tra: ✅ Layout không bị vỡ
```

### ✅ Test 4: Zalo WebView
```bash
1. Gửi link trong chat Zalo
2. Click vào link → Mở trong Zalo browser
3. Test scroll như trên
4. Kiểm tra: ✅ Hiển thị giống Chrome/Safari
```

---

## 🔍 CONSOLE DEBUG SCRIPT

Copy/paste vào DevTools Console để debug:

```javascript
// ==========================================
// 🔍 VIEWPORT DEBUG TOOL
// ==========================================

console.clear();
console.log('%c🔍 VIEWPORT DEBUG', 'font-size:20px;color:#2563EB;font-weight:bold');

// 1. Viewport Dimensions
console.log('\n📏 VIEWPORT DIMENSIONS:');
console.log('window.innerWidth:', window.innerWidth);
console.log('window.innerHeight:', window.innerHeight);
console.log('window.outerHeight:', window.outerHeight);
if (window.visualViewport) {
    console.log('visualViewport.width:', window.visualViewport.width);
    console.log('visualViewport.height:', window.visualViewport.height);
    console.log('visualViewport.scale:', window.visualViewport.scale);
}

// 2. CSS Variables
console.log('\n💎 CSS CUSTOM PROPERTIES:');
const rootStyles = getComputedStyle(document.documentElement);
const vhVar = rootStyles.getPropertyValue('--vh');
console.log('--vh variable:', vhVar || '❌ NOT SET');
if (vhVar) {
    console.log('Calculated 100vh:', parseFloat(vhVar) * 100 + 'px');
}

// 3. Browser Support
console.log('\n📦 BROWSER FEATURE SUPPORT:');
console.log('Supports 100dvh:', CSS.supports('height', '100dvh') ? '✅' : '❌');
console.log('Supports -webkit-fill-available:', CSS.supports('height', '-webkit-fill-available') ? '✅' : '❌');
console.log('Supports calc(var(--vh)):', CSS.supports('height', 'calc(var(--vh) * 100)') ? '✅' : '❌');
console.log('Supports env(safe-area-inset-*):', CSS.supports('padding', 'env(safe-area-inset-top)') ? '✅' : '❌');

// 4. Safe Area Insets
console.log('\n🔒 SAFE AREA INSETS:');
['top', 'right', 'bottom', 'left'].forEach(side => {
    const value = rootStyles.getPropertyValue(`padding-${side}`);
    console.log(`safe-area-inset-${side}:`, value || '0px');
});

// 5. Viewport Units Test
console.log('\n📐 VIEWPORT UNITS COMPARISON:');
const testDiv = document.createElement('div');
testDiv.style.cssText = 'position:fixed;top:0;left:-9999px;';
document.body.appendChild(testDiv);

testDiv.style.height = '100vh';
const vh = testDiv.offsetHeight;
testDiv.style.height = '100dvh';
const dvh = testDiv.offsetHeight;
testDiv.style.height = '-webkit-fill-available';
const wfa = testDiv.offsetHeight;

console.log('100vh =', vh + 'px');
console.log('100dvh =', dvh + 'px', dvh !== vh ? '⚠️ DIFFERENT' : '✅ SAME');
console.log('-webkit-fill-available =', wfa + 'px');

document.body.removeChild(testDiv);

// 6. Real-time Monitoring
console.log('\n👀 MONITORING VIEWPORT CHANGES...');
console.log('(Scroll or rotate device to see updates)');

if (window.visualViewport) {
    let lastHeight = window.visualViewport.height;
    
    window.visualViewport.addEventListener('resize', () => {
        const newHeight = window.visualViewport.height;
        const diff = newHeight - lastHeight;
        
        console.log('%c📐 Viewport Resized', 'color:#FFC107;font-weight:bold');
        console.log('New height:', newHeight);
        console.log('Change:', diff > 0 ? `+${diff}px` : `${diff}px`);
        console.log('Reason:', diff > 100 ? 'Address bar hidden' : diff < -100 ? 'Address bar shown' : 'Minor adjustment');
        
        lastHeight = newHeight;
    });
}

// 7. Performance Test
console.log('\n⚡ PERFORMANCE CHECK:');
const perfEntries = performance.getEntriesByType('navigation')[0];
if (perfEntries) {
    console.log('DOM Content Loaded:', Math.round(perfEntries.domContentLoadedEventEnd) + 'ms');
    console.log('Page Load Complete:', Math.round(perfEntries.loadEventEnd) + 'ms');
}

console.log('\n✅ Debug tool loaded. Scroll or rotate to monitor changes.');
```

---

## 📱 DEVICE-SPECIFIC TESTS

### iPhone SE (375x667) - Smallest Modern iPhone
```javascript
// Test trong DevTools
// 1. Set resolution: 375x667
// 2. Kiểm tra tất cả sections hiển thị đầy đủ
// 3. Clubs section: 3 cards vertical scroll OK?
// 4. Jobs section: 1 job per page OK?
```

### iPhone 12 Pro (390x844) - Standard iPhone
```javascript
// Test trên thiết bị thật hoặc DevTools
// 1. Kiểm tra notch area không che content
// 2. Home indicator area có padding OK?
// 3. Address bar ẩn/hiện không gây overflow
```

### iPhone 14 Pro Max (430x932) - Largest iPhone
```javascript
// Test layout không bị stretch quá mức
// 1. Font sizes reasonable?
// 2. Images không bị pixelated?
// 3. Safe area insets đúng?
```

### Samsung Galaxy S20 (360x800) - Android Standard
```javascript
// Test trên Chrome Android
// 1. Address bar behavior khác iOS
// 2. Scroll performance smooth?
// 3. Rotation không gây layout break?
```

### Samsung Galaxy S20 Ultra (412x915) - Large Android
```javascript
// Test high-DPI display
// 1. Images sharp?
// 2. Text readable?
// 3. Touch targets đủ lớn (44x44px)?
```

---

## 🎯 EXPECTED BEHAVIORS

### ✅ CORRECT (Pass)
- Scroll lên → Address bar ẩn → **Không có gap ở bottom**
- Scroll xuống → Address bar hiện → **Layout không bị đẩy**
- Rotate thiết bị → **Layout adjust smooth**
- Open keyboard → **Content không bị che**
- Close keyboard → **Layout trở về bình thường**
- Back/Forward navigation → **State preserved**

### ❌ INCORRECT (Fail - Cần fix)
- Scroll lên → **Gap trắng ở bottom** (100vh overflow)
- Scroll xuống → **Content bị đẩy lên** (layout shift)
- Rotate thiết bị → **Content bị cut off**
- Open keyboard → **Layout vỡ**
- Close keyboard → **Layout không recover**
- Notch area → **Content bị che**

---

## 📸 VISUAL REGRESSION TEST

### Test 1: Screenshot Comparison
```bash
# Chụp screenshot ở 2 trạng thái
1. Address bar VISIBLE
2. Address bar HIDDEN

# Kiểm tra:
- Chiều cao sections GIỐNG NHAU
- Không có gap xuất hiện
- Content position KHÔNG THAY ĐỔI
```

### Test 2: Video Recording
```bash
1. Quay video scroll từ top → bottom
2. Play lại với slow motion
3. Kiểm tra:
   - Smooth scroll (no jank)
   - No layout shifts
   - No white gaps appearing
```

---

## 🔧 QUICK FIX IF ISSUES FOUND

### Issue 1: Still seeing white gap
```css
/* Check if dvh is being applied */
/* Open DevTools → Elements → Computed → Search "height" */
/* Expected: min-height: 100dvh (on modern browsers) */

/* If not, check @supports blocks are correct */
@supports (min-height: 100dvh) {
    #hero {
        min-height: 100dvh; /* Should be here */
    }
}
```

### Issue 2: JavaScript calculator not working
```javascript
// Check console for errors
console.log('--vh:', getComputedStyle(document.documentElement).getPropertyValue('--vh'));

// Should output: "8.44px" or similar
// If empty, calculator không chạy
```

### Issue 3: Notch area cutting content (iPhone X+)
```css
/* Check safe-area-inset được apply */
body {
    padding-top: env(safe-area-inset-top, 0); /* Should be 44px on iPhone X */
}

/* Debug in DevTools Computed styles */
```

### Issue 4: Zalo WebView still broken
```javascript
// Zalo WebView might not support dvh
// Should fallback to --vh calculator
// Check console log trong Zalo:
// Right-click → Inspect Element (if available)
// Or test với remote debugging
```

---

## 📊 SUCCESS CRITERIA

### ✅ All tests pass if:
1. **No white gaps** in any scroll position
2. **No overflow** when address bar shows/hides
3. **Smooth transitions** when rotating device
4. **No layout shifts** (CLS = 0)
5. **Content visible** on all screen sizes (350px - 932px)
6. **Safe areas respected** on iPhone X+
7. **Works in DevTools** AND **real devices**
8. **Zero console errors** related to viewport

### 📈 Performance criteria:
- First Contentful Paint (FCP) < 2s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- Time to Interactive (TTI) < 3s

---

## 🚀 PRODUCTION CHECKLIST

Trước khi deploy production:

- [ ] Test trên ít nhất 3 thiết bị thật
- [ ] Test trên cả portrait và landscape
- [ ] Test với slow 3G network
- [ ] Test back/forward navigation
- [ ] Test deep links (từ social media)
- [ ] Test trong private/incognito mode
- [ ] Verify console có 0 errors
- [ ] Run Lighthouse audit (score > 90)
- [ ] Cross-browser test (Chrome/Safari/Samsung)
- [ ] Accessibility check (a11y)

---

## 📞 TROUBLESHOOTING

### Problem: "Tôi test trong DevTools ổn nhưng real device vẫn lỗi"
**Solution:** DevTools KHÔNG mô phỏng chính xác address bar behavior. Luôn test trên thiết bị thật!

### Problem: "Zalo WebView vẫn hiển thị khác Chrome"
**Solution:** Zalo WebView dựa trên engine cũ hơn. Kiểm tra fallback Layer 4 (--vh calculator) có hoạt động.

### Problem: "iPhone notch che nội dung"
**Solution:** Verify `viewport-fit=cover` trong meta tag và `safe-area-inset` trong CSS.

### Problem: "Scroll bị lag/jank trên mobile"
**Solution:** Check `will-change`, `backface-visibility`, và passive listeners đã được apply.

---

**✅ DONE! Follow guide này để test đầy đủ trước khi deploy production.**

**⏱️ Ước tính: 15-20 phút cho complete test trên 3 devices.**
