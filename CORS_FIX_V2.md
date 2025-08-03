# حل مشاكل CORS - الإصدار الثاني

## المشاكل المحددة:
1. **خطأ API**: `POST https://office-management-system-qxrh1811w.vercel.app/api/projects 400` - يحاول الاتصال بـ API محلي
2. **خطأ WebSocket**: `WebSocket connection to 'wss://office-management-system-v82i.onrender.com/socket.io/' failed`
3. **مشكلة في توجيه الطلبات**: لا يتم توجيه الطلبات إلى Render بشكل صحيح

## الحلول المطبقة:

### 1. تصحيح `lib/config.ts`:
```typescript
// في الإنتاج، دائماً استخدم Render API
export function getApiUrl(endpoint: string): string {
  if (isProduction) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://office-management-system-v82i.onrender.com'
    return `${apiUrl}${endpoint}`
  }
  return endpoint
}
```

### 2. تعطيل WebSocket في الإنتاج:
```typescript
// WebSocket معطل في الإنتاج (Render لا يدعمه)
if (process.env.NODE_ENV === 'production') {
  console.log('WebSocket disabled in production - Render compatibility')
  return
}
```

### 3. إزالة middleware و CORS headers من Vercel:
- حذف `middleware.ts`
- إزالة CORS headers من `next.config.mjs`
- إزالة CORS headers من `vercel.json`

## إعدادات Environment Variables:

### في Vercel Dashboard:
```
NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
NODE_ENV=production
```

### في Render Dashboard:
```
CORS_ORIGIN=https://office-management-system-qxrh1811w.vercel.app
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
NODE_ENV=production
PORT=3000
```

## خطوات التطبيق:

### 1. في Render Dashboard:
1. اذهب إلى Environment Variables
2. تأكد من أن `CORS_ORIGIN` مضبوط على: `https://office-management-system-qxrh1811w.vercel.app`
3. اضغط "Save, rebuild, and deploy"

### 2. في Vercel Dashboard:
1. اذهب إلى Environment Variables
2. تأكد من وجود `NEXT_PUBLIC_API_URL` بقيمة: `https://office-management-system-v82i.onrender.com`
3. احفظ التغييرات

### 3. إعادة نشر الكود:
```bash
git add .
git commit -m "Fix API routing to Render and disable WebSocket in production"
git push origin main
```

## اختبار الحل:

### 1. اختبار API:
```bash
curl https://office-management-system-v82i.onrender.com/api/health
```

### 2. اختبار CORS:
```bash
curl -H "Origin: https://office-management-system-qxrh1811w.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://office-management-system-v82i.onrender.com/api/health
```

### 3. اختبار في المتصفح:
- افتح Developer Tools
- اذهب إلى صفحة المشاريع
- تحقق من عدم وجود أخطاء CORS
- جرب إنشاء مشروع جديد

## النتائج المتوقعة:

1. **جميع API calls** ستذهب إلى Render
2. **لا توجد أخطاء CORS** في الكونسول
3. **إنشاء المشاريع** سيعمل بشكل صحيح
4. **WebSocket** سيكون معطلاً في الإنتاج (بدون أخطاء)

## ملاحظات مهمة:

1. **WebSocket معطل**: في الإنتاج، WebSocket معطل لأن Render لا يدعمه بشكل جيد
2. **النظام سيعمل**: جميع الوظائف الأساسية ستعمل بدون WebSocket
3. **التحديثات اللحظية**: لن تعمل في الإنتاج، لكن النظام سيعمل بشكل طبيعي
4. **جميع الطلبات**: ستذهب إلى Render API

## استكشاف الأخطاء:

### إذا استمرت مشاكل API:
1. تحقق من `NEXT_PUBLIC_API_URL` في Vercel
2. تأكد من أن Render يعمل بشكل صحيح
3. تحقق من logs في Render

### إذا استمرت مشاكل CORS:
1. تحقق من `CORS_ORIGIN` في Render
2. تأكد من عدم وجود `/` في النهاية
3. تحقق من أن Render يعمل 