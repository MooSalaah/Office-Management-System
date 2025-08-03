# حل مشاكل API و قاعدة البيانات

## المشاكل الحالية:
1. **API يعمل لكن قاعدة البيانات فارغة**: `{"success":true,"data":[]}`
2. **خطأ 400 عند إنشاء مشروع**: `POST 400 (Bad Request)`
3. **التطبيق يحاول الاتصال بـ API محلي بدلاً من Render**

## 🔍 التحقق من الإعدادات:

### 1. في Vercel Dashboard:
```env
# تأكد من وجود هذه المتغيرات:
NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
NODE_ENV=production
```

### 2. في Render Dashboard:
```env
# تأكد من وجود هذه المتغيرات:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://office-management-system-d5i27saku.vercel.app
NODE_ENV=production
PORT=3000
```

## 🛠️ خطوات الحل:

### 1. تحديث Vercel Environment Variables:
```bash
# في Vercel Dashboard > Settings > Environment Variables:
NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
```

### 2. تحديث Render Environment Variables:
```bash
# في Render Dashboard > Environment:
CORS_ORIGIN=https://office-management-system-d5i27saku.vercel.app
```

### 3. اختبار API مباشرة:
```bash
# اختبار Render API:
curl https://office-management-system-v82i.onrender.com/api/health

# اختبار Vercel API:
curl https://office-management-system-d5i27saku.vercel.app/api/health
```

### 4. اختبار قاعدة البيانات:
```bash
# اختبار جلب المشاريع من Render:
curl https://office-management-system-v82i.onrender.com/api/projects

# اختبار جلب المشاريع من Vercel:
curl https://office-management-system-d5i27saku.vercel.app/api/projects
```

## 🔧 إصلاح مشكلة توجيه API:

### المشكلة:
التطبيق يحاول الاتصال بـ API محلي في Vercel بدلاً من Render

### الحل:
تأكد من أن `NEXT_PUBLIC_API_URL` مضبوط في Vercel

### التحقق من الكود:
```typescript
// في lib/config.ts
export function getApiUrl(endpoint: string): string {
  if (isProduction) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://office-management-system-v82i.onrender.com'
    return `${apiUrl}${endpoint}`
  }
  return endpoint
}
```

## 🧪 اختبار الحل:

### 1. اختبار في المتصفح:
```bash
# افتح Developer Tools > Network
# اذهب إلى صفحة المشاريع
# تحقق من أن الطلبات تذهب إلى Render وليس Vercel
```

### 2. اختبار إنشاء مشروع:
```bash
# جرب إنشاء مشروع جديد
# تحقق من عدم وجود خطأ 400
# تحقق من أن المشروع يتم حفظه في قاعدة البيانات
```

### 3. اختبار قاعدة البيانات:
```bash
# اذهب إلى MongoDB Atlas
# تحقق من وجود البيانات في قاعدة البيانات
```

## 📋 قائمة التحقق:

### في Vercel:
- [ ] `NEXT_PUBLIC_API_URL` مضبوط على Render URL
- [ ] `NODE_ENV` مضبوط على `production`
- [ ] تم إعادة نشر التطبيق بعد تحديث المتغيرات

### في Render:
- [ ] `MONGODB_URI` صحيح ومتصل
- [ ] `CORS_ORIGIN` مضبوط على Vercel URL
- [ ] `JWT_SECRET` موجود
- [ ] التطبيق يعمل بدون أخطاء

### في MongoDB Atlas:
- [ ] قاعدة البيانات متصلة
- [ ] IP whitelist يسمح بـ Render
- [ ] المستخدم لديه صلاحيات كافية

## 🚨 إذا استمرت المشكلة:

### 1. تحقق من Render Logs:
```bash
# في Render Dashboard > Logs
# تحقق من أخطاء الاتصال بقاعدة البيانات
```

### 2. تحقق من Vercel Logs:
```bash
# في Vercel Dashboard > Functions > Logs
# تحقق من أخطاء API calls
```

### 3. اختبار قاعدة البيانات مباشرة:
```bash
# استخدم MongoDB Compass أو Studio
# تحقق من الاتصال بقاعدة البيانات
```

## 🎯 النتيجة المتوقعة:

بعد تطبيق الحلول:
1. **جميع API calls** تذهب إلى Render
2. **قاعدة البيانات** متصلة وتعمل
3. **إنشاء المشاريع** يعمل بدون أخطاء
4. **البيانات** تظهر في التطبيق

هل تريد المساعدة في تطبيق هذه الحلول؟ 