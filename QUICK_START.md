# دليل الإعداد السريع 🚀

## خطوات الإعداد (5 دقائق)

### 1. إعداد Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ حساب مجاني
3. أنشئ مشروع جديد
4. انسخ:
   - Project URL
   - Anon/Public Key

### 2. تحديث ملف البيئة
افتح ملف `.env` وضع بياناتك:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. تطبيق قاعدة البيانات
1. في Supabase، اذهب إلى SQL Editor
2. انسخ محتويات ملف `database/schema.sql`
3. اضغط Run لتطبيق قاعدة البيانات

### 4. تشغيل التطبيق
```bash
npm run dev
```

### 5. تسجيل الدخول
- **المستخدم**: admin
- **كلمة المرور**: admin

## ✅ جاهز للاستخدام!

التطبيق الآن يعمل مع قاعدة بيانات حقيقية ومزامنة تلقائية.

## اختبر الميزات:
- ✅ إنشاء محضر جديد
- ✅ البحث في المحاضر
- ✅ إضافة مستخدمين جدد
- ✅ عرض التقارير

## للمساعدة:
📧 اتصل بنا: support@safwa.com
