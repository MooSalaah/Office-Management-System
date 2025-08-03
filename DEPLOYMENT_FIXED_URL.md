# حل مشكلة تغيير رابط Vercel عند كل Deploy

## 🎯 المشكلة:
رابط Vercel يتغير عند كل deploy، مما يسبب مشاكل في الربط مع Render

## 🛠️ الحلول:

### 1. **استخدام Custom Domain (الأفضل)** ⭐⭐⭐⭐⭐

#### الخطوات:
1. **في Vercel Dashboard:**
   - اذهب إلى Settings > Domains
   - أضف domain مخصص مثل: `office-management.vercel.app`

2. **تحديث Environment Variables:**
   ```env
   # في Render Dashboard:
   CORS_ORIGIN=https://office-management.vercel.app
   
   # في Vercel Dashboard:
   NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
   ```

### 2. **استخدام Vercel CLI لتثبيت الرابط** ⭐⭐⭐⭐

#### الخطوات:
```bash
# 1. تثبيت Vercel CLI (تم بالفعل)
npm install -g vercel

# 2. تسجيل الدخول
vercel login

# 3. ربط المشروع
vercel link

# 4. تعيين alias ثابت
vercel alias set https://office-management-system-d5i27saku.vercel.app office-management.vercel.app
```

### 3. **تحديث vercel.json** ⭐⭐⭐

تم تحديث `vercel.json` ليشمل:
```json
{
  "version": 2,
  "name": "office-management-system",
  "alias": ["office-management.vercel.app"],
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🚀 خطوات التطبيق:

### 1. **إنشاء Custom Domain:**
```bash
# في Vercel Dashboard > Settings > Domains
# أضف: office-management.vercel.app
```

### 2. **تحديث Render Environment Variables:**
```env
CORS_ORIGIN=https://office-management.vercel.app
```

### 3. **تحديث Vercel Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
```

### 4. **إعادة نشر التطبيق:**
```bash
git add .
git commit -m "Fix: Add custom domain alias to vercel.json"
git push origin main
```

## 🧪 اختبار الحل:

### 1. **اختبار Custom Domain:**
```bash
# افتح المتصفح واذهب إلى:
https://office-management.vercel.app
```

### 2. **اختبار API:**
```bash
# اختبار Render API:
curl https://office-management-system-v82i.onrender.com/api/health

# اختبار Vercel API:
curl https://office-management.vercel.app/api/health
```

### 3. **اختبار CORS:**
```bash
# اختبار من Vercel إلى Render:
curl -H "Origin: https://office-management.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://office-management-system-v82i.onrender.com/api/projects
```

## 📋 قائمة التحقق:

### في Vercel:
- [ ] Custom domain تم إنشاؤه: `office-management.vercel.app`
- [ ] `NEXT_PUBLIC_API_URL` مضبوط على Render URL
- [ ] `vercel.json` محدث مع alias
- [ ] تم إعادة نشر التطبيق

### في Render:
- [ ] `CORS_ORIGIN` مضبوط على Custom domain
- [ ] `MONGODB_URI` صحيح ومتصل
- [ ] `JWT_SECRET` موجود

## 🎯 النتيجة المتوقعة:

بعد تطبيق الحلول:
1. **رابط Vercel ثابت**: `https://office-management.vercel.app`
2. **لا يتغير عند كل deploy**
3. **CORS يعمل بشكل صحيح**
4. **API calls تذهب إلى Render**
5. **قاعدة البيانات متصلة وتعمل**

## 🚨 إذا لم يعمل Custom Domain:

### البديل: استخدام Vercel CLI
```bash
# 1. تسجيل الدخول
vercel login

# 2. ربط المشروع
vercel link

# 3. تعيين alias
vercel alias set https://office-management-system-d5i27saku.vercel.app office-management.vercel.app

# 4. نشر مع alias
vercel --prod
```

هل تريد المساعدة في تطبيق هذه الحلول؟ 