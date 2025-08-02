# دليل نشر المشروع

## المتغيرات البيئية المطلوبة

### Netlify (Frontend)
```env
NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
```

### Render (Backend)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-here
CORS_ORIGIN=https://newcornersa.netlify.app
NODE_ENV=production
PORT=3000
```

## خطوات النشر

### 1. MongoDB Atlas
- إنشاء cluster جديد
- إنشاء مستخدم لقاعدة البيانات
- الحصول على connection string
- إضافة IP whitelist (0.0.0.0/0 للوصول من أي مكان)

### 2. Render (Backend)
- رفع الكود إلى GitHub
- إنشاء Web Service جديد في Render
- ربط repository
- إعداد المتغيرات البيئية
- تحديد build command: `npm install && npm run build`
- تحديد start command: `npm start`

### 3. Netlify (Frontend)
- رفع الكود إلى GitHub
- إنشاء site جديد في Netlify
- ربط repository
- إعداد المتغيرات البيئية
- تحديد build command: `npm run build`
- تحديد publish directory: `.next`

## التحقق من الإعداد

### 1. اختبار الاتصال بقاعدة البيانات
```bash
# في Render logs
curl https://office-management-system-v82i.onrender.com/api/health
```

### 2. اختبار CORS
```bash
# من Netlify إلى Render
curl -H "Origin: https://newcornersa.netlify.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://office-management-system-v82i.onrender.com/api/projects
```

### 3. اختبار API
```bash
# اختبار جلب المشاريع
curl https://office-management-system-v82i.onrender.com/api/projects
```

## استكشاف الأخطاء

### مشاكل شائعة:
1. **خطأ CORS**: تأكد من إعداد `CORS_ORIGIN` بشكل صحيح
2. **خطأ قاعدة البيانات**: تأكد من صحة `MONGODB_URI`
3. **خطأ JWT**: تأكد من إعداد `JWT_SECRET`
4. **خطأ API URL**: تأكد من إعداد `NEXT_PUBLIC_API_URL` في Netlify

### سجلات الأخطاء:
- Render: Site > Logs
- Netlify: Site > Functions > Logs
- MongoDB: Atlas > Logs 