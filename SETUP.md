# دليل الإعداد السريع

## المتطلبات الأساسية

- Node.js 18+ 
- MongoDB Atlas (للإنتاج)
- npm أو yarn
- حساب Render.com
- حساب Vercel.com

## التثبيت والإعداد

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. إعداد قاعدة البيانات

#### للتطوير المحلي:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/office_management
MONGODB_DB=office_management

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### للإنتاج:
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secure-jwt-secret-key-here

# CORS Origin
CORS_ORIGIN=https://office-management-system-iota.vercel.app

# API URL
NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
```

### 3. تشغيل المشروع

```bash
# وضع التطوير
npm run dev

# بناء الإنتاج
npm run build
npm start
```

المشروع سيعمل على `http://localhost:3000`

### 4. حل مشاكل البناء

إذا واجهت مشاكل في البناء:

```bash
# تنظيف cache
npm run clean

# إعادة تثبيت التبعيات
npm run reinstall

# إعادة البناء
npm run rebuild
```

## بنية المشروع

### السكيمات (Schemas)
- `lib/schemas/user.ts` - سكيما المستخدمين
- `lib/schemas/client.ts` - سكيما العملاء  
- `lib/schemas/project.ts` - سكيما المشاريع
- `lib/schemas/task.ts` - سكيما المهام
- `lib/schemas/finance.ts` - سكيما المالية
- `lib/schemas/attendance.ts` - سكيما الحضور

### النماذج (Models)
- `lib/models/user.ts` - نموذج المستخدمين
- `lib/models/client.ts` - نموذج العملاء
- `lib/models/project.ts` - نموذج المشاريع

### قاعدة البيانات
- `lib/database.ts` - اتصال MongoDB

## الميزات المضافة

### 1. Container Component
- تم إضافة مكون Container لتغليف جميع الصفحات
- يوفر تخطيط موحد ومتجاوب

### 2. MongoDB Integration
- سكيمات Zod للتحقق من صحة البيانات
- نماذج للتعامل مع قاعدة البيانات
- فهارس محسنة للأداء

### 3. Authentication Ready
- نظام مصادقة جاهز مع JWT
- تشفير كلمات المرور بـ bcrypt
- إدارة الأدوار والصلاحيات

## النشر

### Render (Backend)
1. ارفع الكود إلى GitHub
2. اذهب إلى Render.com
3. أنشئ Web Service جديد
4. اربط repository
5. أضف المتغيرات البيئية

### Vercel (Frontend)
1. اذهب إلى Vercel.com
2. أنشئ project جديد من GitHub
3. أضف `NEXT_PUBLIC_API_URL` و `CORS_ORIGIN`

## استكشاف الأخطاء

### مشاكل شائعة:
- **خطأ في المكونات**: تأكد من وجود جميع ملفات UI
- **خطأ في قاعدة البيانات**: تأكد من صحة MongoDB URI
- **خطأ في البناء**: جرب `npm run rebuild`

### سجلات الأخطاء:
- Render: Site > Logs
- Vercel: Project > Functions > Logs

## الملفات المضافة

- `render.yaml` - تكوين Render
- `vercel.json` - تكوين Vercel
- `.npmrc` - تكوين npm
- `app/api/health/route.ts` - فحص صحة النظام
- `lib/config.ts` - تكوين النظام 