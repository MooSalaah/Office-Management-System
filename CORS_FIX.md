# حل مشاكل CORS بين Vercel و Render

## المشاكل الحالية:
1. **خطأ CORS**: `Access to XMLHttpRequest has been blocked by CORS policy`
2. **خطأ WebSocket**: `net::ERR_FAILED 308 (Permanent Redirect)` للـ Socket.io
3. **خطأ API**: `POST 400 (Bad Request)` عند إنشاء المشروع

## الحلول المطبقة:

### 1. إعدادات CORS في Render (Backend):

#### في Render Dashboard:
```
CORS_ORIGIN=https://office-management-system-iota.vercel.app
```

**مهم**: تأكد من إزالة `/` من النهاية!

### 2. إعدادات CORS في Vercel (Frontend):

#### في Vercel Dashboard:
```
NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
CORS_ORIGIN=https://office-management-system-iota.vercel.app
```

### 3. الملفات المحدثة:

#### `middleware.ts` - معالجة CORS لجميع API routes
#### `next.config.mjs` - إضافة CORS headers
#### `vercel.json` - إعدادات Vercel مع CORS
#### `app/api/socket/route.ts` - تصحيح CORS للـ WebSocket
#### `hooks/use-api.ts` - إضافة credentials للطلبات
#### `hooks/use-socket.ts` - تحسين إعدادات WebSocket

## خطوات التطبيق:

### 1. في Render Dashboard:
1. اذهب إلى Environment Variables
2. تأكد من أن `CORS_ORIGIN` مضبوط على: `https://office-management-system-iota.vercel.app`
3. اضغط "Save, rebuild, and deploy"

### 2. في Vercel Dashboard:
1. اذهب إلى Environment Variables
2. أضف `CORS_ORIGIN` بقيمة: `https://office-management-system-iota.vercel.app`
3. تأكد من وجود `NEXT_PUBLIC_API_URL`
4. احفظ التغييرات

### 3. إعادة نشر الكود:
```bash
git add .
git commit -m "Fix CORS issues between Vercel and Render"
git push origin main
```

## اختبار الحل:

### 1. اختبار CORS:
```bash
curl -H "Origin: https://office-management-system-iota.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://office-management-system-v82i.onrender.com/api/health
```

### 2. اختبار API:
```bash
curl https://office-management-system-v82i.onrender.com/api/health
```

### 3. اختبار WebSocket:
- افتح Developer Tools في المتصفح
- اذهب إلى صفحة المشاريع
- تحقق من عدم وجود أخطاء CORS في Console

## ملاحظات مهمة:

1. **WebSocket في Render**: Render لا يدعم WebSocket بشكل جيد، لذا تم إضافة fallback إلى polling
2. **Credentials**: تم إضافة `credentials: 'include'` لجميع طلبات API
3. **CORS Headers**: تم إضافة CORS headers في middleware و next.config.mjs
4. **Environment Variables**: تأكد من إعداد جميع المتغيرات البيئية بشكل صحيح

## استكشاف الأخطاء:

### إذا استمرت مشاكل CORS:
1. تحقق من إعدادات Environment Variables في Render و Vercel
2. تأكد من عدم وجود `/` في نهاية `CORS_ORIGIN`
3. تحقق من logs في Render و Vercel
4. اختبر API endpoints مباشرة

### إذا استمرت مشاكل WebSocket:
1. WebSocket قد لا يعمل بشكل مثالي في Render
2. النظام سيعمل بدون التحديثات اللحظية
3. يمكن إضافة WebSocket server منفصل في المستقبل 