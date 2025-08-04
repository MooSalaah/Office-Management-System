# التحقق من Environment Variables

## 🎯 **التكوين المطلوب:**

### **1. في Netlify Dashboard:**
```env
NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com
NODE_ENV=production
```

### **2. في Render Dashboard:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://newcornersa.netlify.app
NODE_ENV=production
PORT=3000
```

## 🔍 **خطوات التحقق:**

### **1. التحقق من Netlify:**
1. اذهب إلى Netlify Dashboard
2. اختر موقعك: `newcornersa`
3. اذهب إلى Site settings > Environment variables
4. تأكد من وجود:
   - `NEXT_PUBLIC_API_URL=https://office-management-system-v82i.onrender.com`
   - `NODE_ENV=production`

### **2. التحقق من Render:**
1. اذهب إلى Render Dashboard
2. اختر خدمتك: `office-management-system-v82i`
3. اذهب إلى Environment
4. تأكد من وجود:
   - `MONGODB_URI` (رابط MongoDB)
   - `JWT_SECRET` (مفتاح JWT)
   - `CORS_ORIGIN=https://newcornersa.netlify.app`
   - `NODE_ENV=production`
   - `PORT=3000`

### **3. اختبار الاتصال:**
```bash
# اختبار API
curl https://office-management-system-v82i.onrender.com/api/health

# اختبار Socket.io
curl https://office-management-system-v82i.onrender.com/api/socket
```

## 🚨 **إذا كانت هناك مشاكل:**

### **1. مشكلة في API:**
- تحقق من `NEXT_PUBLIC_API_URL` في Netlify
- تحقق من `MONGODB_URI` في Render

### **2. مشكلة في CORS:**
- تحقق من `CORS_ORIGIN` في Render
- تأكد من تطابق الرابط مع Netlify

### **3. مشكلة في Socket.io:**
- تحقق من `CORS_ORIGIN` في Render
- تأكد من أن Socket.io يستخدم Polling

## 🎉 **النتيجة المتوقعة:**

بعد التأكد من Environment Variables:
- ✅ **Frontend** يتصل بـ Backend
- ✅ **Backend** يتصل بـ Database
- ✅ **Socket.io** يعمل بدون أخطاء CORS
- ✅ **جميع الميزات تعمل**

## 📞 **للحصول على المساعدة:**

إذا واجهت مشاكل:
1. تحقق من Environment Variables
2. راجع Console في المتصفح
3. تحقق من Network Tab
4. راجع Render Logs 