# دليل التحقق الشامل من الإعدادات

## 🎯 المشكلة الحالية:
- خطأ 400 عند إنشاء المشروع
- التطبيق يحاول الاتصال بـ Vercel API بدلاً من Render
- WebSocket لا يعمل

## 🔍 خطوات التحقق:

### 1. **التحقق من Vercel Environment Variables:**

#### في Vercel Dashboard:
1. اذهب إلى Project Settings > Environment Variables
2. تأكد من وجود:
   ```env
   NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
   NODE_ENV=production
   ```

### 2. **التحقق من Render Environment Variables:**

#### في Render Dashboard:
1. اذهب إلى Environment
2. تأكد من وجود:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   JWT_SECRET=your-super-secure-jwt-secret
   CORS_ORIGIN=https://office-management-system-iota.vercel.app
   NODE_ENV=production
   PORT=3000
   ```

### 3. **اختبار API مباشرة:**

#### اختبار Render API:
```bash
curl https://office-management-system-v82i.onrender.com/api/health
```

#### اختبار Vercel API:
```bash
curl https://office-management-system-iota.vercel.app/api/health
```

### 4. **اختبار قاعدة البيانات:**

#### اختبار جلب المشاريع من Render:
```bash
curl https://office-management-system-v82i.onrender.com/api/projects
```

#### اختبار إنشاء مشروع في Render:
```bash
curl -X POST https://office-management-system-v82i.onrender.com/api/projects \
  -H "Content-Type: application/json" \
  -H "Origin: https://office-management-system-iota.vercel.app" \
  -d '{
    "name": "مشروع تجريبي",
    "description": "اختبار الاتصال",
    "totalValue": 1000,
    "advanceAmount": 0,
    "startDate": "2025-08-03"
  }'
```

### 5. **التحقق من الكود:**

#### في lib/config.ts:
```typescript
export function getApiUrl(endpoint: string): string {
  if (isProduction) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://office-management-system-v82i.onrender.com'
    return `${apiUrl}${endpoint}`
  }
  return endpoint
}
```

#### في hooks/use-api.ts:
```typescript
const response = await fetch(url, {
  method,
  headers: {
    'Content-Type': 'application/json',
    ...headers,
  },
  credentials: 'include', // مهم!
  body: method !== 'GET' ? JSON.stringify(data) : undefined,
})
```

### 6. **اختبار في المتصفح:**

#### افتح Developer Tools > Network:
1. اذهب إلى صفحة المشاريع
2. حاول إنشاء مشروع جديد
3. تحقق من أن الطلبات تذهب إلى Render وليس Vercel

#### في Console:
```javascript
// تحقق من Environment Variables
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('NODE_ENV:', process.env.NODE_ENV)
```

### 7. **التحقق من MongoDB Atlas:**

#### في MongoDB Atlas:
1. اذهب إلى Database > Browse Collections
2. تحقق من وجود البيانات
3. تحقق من Network Access (IP whitelist)
4. تحقق من Database Access (users)

### 8. **اختبار WebSocket:**

#### في Console:
```javascript
// تحقق من WebSocket connection
console.log('WebSocket URL:', process.env.NEXT_PUBLIC_API_URL)
```

## 🚨 **إذا لم يعمل شيء:**

### 1. **إعادة نشر Vercel:**
```bash
# في Vercel Dashboard > Deployments
# اضغط على "Redeploy"
```

### 2. **إعادة نشر Render:**
```bash
# في Render Dashboard > Manual Deploy
# اضغط على "Deploy latest commit"
```

### 3. **تحديث Environment Variables:**
```bash
# في Vercel Dashboard:
NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com

# في Render Dashboard:
CORS_ORIGIN=https://office-management-system-iota.vercel.app
```

## 📋 **قائمة التحقق النهائية:**

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

### في المتصفح:
- [ ] الطلبات تذهب إلى Render
- [ ] لا توجد أخطاء CORS
- [ ] WebSocket متصل
- [ ] إنشاء المشاريع يعمل

## 🎯 **النتيجة المتوقعة:**

بعد تطبيق جميع الخطوات:
1. **جميع API calls** تذهب إلى Render
2. **قاعدة البيانات** متصلة وتعمل
3. **إنشاء المشاريع** يعمل بدون أخطاء
4. **البيانات** تظهر في التطبيق
5. **WebSocket** يعمل للتحديثات اللحظية

هل تريد المساعدة في تطبيق هذه الخطوات؟ 