# نظام إدارة المكتب (Office Management System)

نظام شامل لإدارة المكتب مبني باستخدام Next.js و TypeScript و Tailwind CSS مع قاعدة بيانات MongoDB و **تحديثات لحظية**.

## المميزات المنجزة

### ✅ الواجهة الأمامية (Frontend)
- **تصميم متجاوب** مع واجهة مستخدم حديثة وجميلة
- **نظام التنقل** مع شريط جانبي قابل للطي
- **صفحات متكاملة** لجميع الوحدات:
  - لوحة التحكم (Dashboard)
  - إدارة العملاء (Clients)
  - إدارة المشاريع (Projects)
  - إدارة المهام (Tasks)
  - إدارة الحضور (Attendance)
  - إدارة المالية (Finance)
  - الإعدادات (Settings)

### ✅ قاعدة البيانات (Database)
- **MongoDB Atlas** كقاعدة بيانات سحابية
- **نماذج شاملة** لجميع الكيانات:
  - المستخدمين (Users)
  - الملفات الشخصية (User Profiles)
  - إعدادات الشركة (Company Settings)
  - العملاء (Clients)
  - المشاريع (Projects)
  - المهام (Tasks)
  - سجلات الحضور (Attendance)
  - طلبات الإجازات (Leave Requests)
  - المعاملات المالية (Transactions)
  - الفواتير (Invoices)

### ✅ الواجهة الخلفية (Backend)
- **API Routes** لجميع العمليات
- **Zod Schemas** للتحقق من البيانات
- **Dynamic Imports** لحل مشاكل البناء
- **معالجة الأخطاء** مع رسائل عربية

### ✅ **التحديثات اللحظية (Real-time Features)** 🆕
- **WebSocket** باستخدام Socket.io للاتصال المباشر
- **الإشعارات الفورية** عند تغيير البيانات
- **مؤشرات حالة الاتصال** في الواجهة
- **النشاطات اللحظية** في لوحة التحكم
- **قائمة المستخدمين المتصلين** مع حالة الاتصال
- **تحديث تلقائي** للبيانات عند التغيير
- **إشعارات مخصصة** للمهام الجديدة

### ✅ المكونات والواجهات
- **Container Component** لتغليف المحتوى
- **UI Components** شاملة ومتعددة الاستخدامات
- **Data Provider** لإدارة البيانات
- **Theme Provider** لدعم الوضع المظلم/الفاتح
- **Toast Notifications** للإشعارات
- **Realtime Provider** للتحديثات اللحظية

## التقنيات المستخدمة

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Real-time**: Socket.io
- **Validation**: Zod
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks

## التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- npm أو yarn
- حساب MongoDB Atlas
- حساب Render.com (للـ Backend)
- حساب Vercel.com (للـ Frontend)

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd Office-Management-System
```

2. **تثبيت التبعيات**
```bash
npm install
```

3. **إعداد متغيرات البيئة**
```bash
# إنشاء ملف .env.local
cp .env.example .env.local

# إضافة رابط MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

4. **تشغيل التطبيق**
```bash
# وضع التطوير
npm run dev

# بناء الإنتاج
npm run build
npm start
```

## 🚀 النشر

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

### المتغيرات البيئية المطلوبة

#### Render (Backend)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-here
CORS_ORIGIN=https://office-management-system-iota.vercel.app
NODE_ENV=production
PORT=3000
```

#### Vercel (Frontend)
```env
NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
CORS_ORIGIN=https://office-management-system-iota.vercel.app
```

## هيكل المشروع

```
Office-Management-System/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── socket/        # Socket.io API
│   │   ├── users/         # Users API
│   │   ├── tasks/         # Tasks API
│   │   └── ...            # Other APIs
│   ├── dashboard/         # صفحة لوحة التحكم
│   ├── clients/           # إدارة العملاء
│   ├── projects/          # إدارة المشاريع
│   ├── tasks/             # إدارة المهام
│   ├── attendance/        # إدارة الحضور
│   ├── finance/           # إدارة المالية
│   └── settings/          # الإعدادات
├── components/            # مكونات React
│   ├── ui/               # مكونات UI الأساسية
│   ├── layout/           # مكونات التخطيط
│   ├── providers/        # مزودي البيانات
│   ├── realtime-provider.tsx    # مزود التحديثات اللحظية
│   └── realtime-activity.tsx    # مكونات النشاط اللحظي
├── hooks/                # React Hooks مخصصة
│   └── use-socket.ts     # Hook للـ Socket.io
├── lib/                  # المكتبات والمساعدات
│   ├── schemas/          # Zod schemas
│   ├── models/           # نماذج قاعدة البيانات
│   └── utils/            # الدوال المساعدة
└── styles/               # ملفات CSS
```

## الميزات المتقدمة

### 🔐 نظام المستخدمين والأدوار
- **أدوار متعددة**: Admin, Engineer, Accountant, HR, Employee
- **الصلاحيات** لكل دور
- **إدارة الملفات الشخصية**
- **تتبع النشاط والجلسات**

### 📊 لوحة التحكم
- **إحصائيات شاملة** لجميع الوحدات
- **رسوم بيانية تفاعلية**
- **مؤشرات الأداء الرئيسية**
- **التقارير المحدثة**
- **النشاطات اللحظية** 🆕
- **قائمة المستخدمين المتصلين** 🆕

### 👥 إدارة العملاء
- **معلومات شاملة** للعملاء
- **تاريخ التعاملات**
- **حالة العميل**
- **البحث والتصفية**

### 🏗️ إدارة المشاريع
- **تتبع التقدم**
- **إدارة الميزانية**
- **تعيين المهام**
- **المواعيد النهائية**

### ✅ إدارة المهام
- **حالات متعددة**: جديد، قيد التنفيذ، مكتمل، معلق، ملغي
- **أولويات**: عالية، متوسطة، منخفضة
- **تعيين للمستخدمين**
- **تتبع الوقت**
- **إشعارات فورية** عند التعيين 🆕

### 📅 إدارة الحضور
- **تسجيل الحضور والانصراف**
- **إدارة الإجازات**
- **تقارير الحضور**
- **إحصائيات شهرية**

### 💰 إدارة المالية
- **المعاملات المالية**
- **إدارة الفواتير**
- **تتبع الإيرادات والمصروفات**
- **التقارير المالية**

### ⚙️ الإعدادات
- **إعدادات الشركة**
- **الملف الشخصي للمستخدم**
- **إعدادات النظام**

## الميزات اللحظية الجديدة 🆕

### 🔔 الإشعارات الفورية
- **إشعارات المهام الجديدة** للمستخدمين المعينين
- **تنبيهات تغيير حالة** المشاريع والمهام
- **إشعارات الحضور** للمديرين
- **تنبيهات المعاملات المالية**

### 👥 التعاون المباشر
- **مؤشرات المستخدمين المتصلين** مع الحالة
- **النشاطات اللحظية** لجميع المستخدمين
- **مؤشرات حالة الاتصال** في الواجهة
- **تحديث تلقائي** للبيانات

### 📊 لوحة التحكم التفاعلية
- **النشاطات اللحظية** في لوحة التحكم
- **قائمة المستخدمين المتصلين**
- **مؤشرات حالة الاتصال**
- **تحديث تلقائي** للإحصائيات

### 🔄 التحديث التلقائي
- **تحديث البيانات** عند التغيير
- **مزامنة فورية** بين المستخدمين
- **تحديث الإحصائيات** تلقائياً
- **تحديث القوائم** فورياً

## كيفية عمل التحديثات اللحظية

### 1. **اتصال WebSocket**
```typescript
// في hooks/use-socket.ts
const socket = io('http://localhost:3001')
socket.on('connect', () => {
  console.log('Connected to real-time server')
})
```

### 2. **إرسال التحديثات**
```typescript
// في API routes
const io = req.socket.server.io
io.emit('data-changed', {
  type: 'create',
  entity: 'task',
  data: newTask
})
```

### 3. **استقبال التحديثات**
```typescript
// في الواجهة الأمامية
socket.on('data-changed', (change) => {
  // تحديث البيانات في الواجهة
  updateData(change)
})
```

## المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة
3. Commit التغييرات
4. Push للفرع
5. إنشاء Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## استكشاف الأخطاء

### مشاكل شائعة:
- **خطأ في المكونات**: تأكد من وجود جميع ملفات UI
- **خطأ في قاعدة البيانات**: تأكد من صحة MongoDB URI
- **خطأ في البناء**: جرب `npm run rebuild`
- **خطأ TailwindCSS**: تأكد من وجود `tailwindcss` و `postcss` في `dependencies`

### حل مشاكل البناء:
```bash
# تنظيف cache
npm run clean

# إعادة تثبيت التبعيات
npm run reinstall

# إعادة البناء
npm run rebuild
```

## النشر (Deployment)

### Frontend (Netlify)
```bash
# في Netlify Dashboard:
NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
NODE_ENV=production

# Custom Domain (مستحسن):
# اذهب إلى Site settings > Domain management وأضف:
# newcornersa.netlify.app
```

### Backend (Render)
```bash
# في Render Dashboard:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://newcornersa.netlify.app
NODE_ENV=production
PORT=3000
```

### 🔗 حل مشكلة تغيير رابط Netlify
راجع ملف `NETLIFY_DEPLOYMENT.md` للحصول على حلول شاملة لتثبيت رابط Netlify.

## الدعم

للدعم والمساعدة، يرجى فتح issue في GitHub أو التواصل عبر البريد الإلكتروني. 