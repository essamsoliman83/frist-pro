-- إنشاء جداول قاعدة البيانات لنظام فحص الصيدليات

-- إنشاء enum لأدوار المستخدمين
CREATE TYPE user_role AS ENUM ('manager', 'inspector', 'supervisor');

-- جدول المستخدمين
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    work_place VARCHAR(200),
    administrative_work_places TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول محاضر التفتيش
CREATE TABLE inspection_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    basic_data JSONB NOT NULL,
    inspection_results JSONB NOT NULL,
    recommendations TEXT,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المرفقات
CREATE TABLE attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id UUID REFERENCES inspection_records(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الإشعارات
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(100),
    record_id UUID REFERENCES inspection_records(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX idx_inspection_records_serial_number ON inspection_records(serial_number);
CREATE INDEX idx_inspection_records_created_by ON inspection_records(created_by);
CREATE INDEX idx_inspection_records_created_at ON inspection_records(created_at DESC);
CREATE INDEX idx_attachments_record_id ON attachments(record_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_users_username ON users(username);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة triggers لتحديث updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_records_updated_at BEFORE UPDATE ON inspection_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدراج مستخدم افتراضي (المدير)
INSERT INTO users (username, password, name, role, administrative_work_places) 
VALUES ('admin', 'admin', 'المدير', 'manager', '{}')
ON CONFLICT (username) DO NOTHING;

-- إنشاء Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للمستخدمين
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Managers can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Managers can delete users" ON users FOR DELETE USING (true);

-- سياسات الأمان لمحاضر التفتيش
CREATE POLICY "Users can view all inspection records" ON inspection_records FOR SELECT USING (true);
CREATE POLICY "Users can insert inspection records" ON inspection_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update inspection records" ON inspection_records FOR UPDATE USING (true);
CREATE POLICY "Users can delete inspection records" ON inspection_records FOR DELETE USING (true);

-- سياسات الأمان للمرفقات
CREATE POLICY "Users can view all attachments" ON attachments FOR SELECT USING (true);
CREATE POLICY "Users can insert attachments" ON attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update attachments" ON attachments FOR UPDATE USING (true);
CREATE POLICY "Users can delete attachments" ON attachments FOR DELETE USING (true);

-- سياسات الأمان للإشعارات
CREATE POLICY "Users can view all notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notifications" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Users can delete notifications" ON notifications FOR DELETE USING (true);
