
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInspectionRecords } from '@/hooks/useInspectionRecords';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, Download, Upload, Database, Shield, AlertTriangle } from 'lucide-react';

export const BackupRestore: React.FC = () => {
  const { currentUser } = useAuth();
  const { records, addRecord } = useInspectionRecords();
  const navigate = useNavigate();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // التحقق من صلاحيات المدير
  if (currentUser?.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4 font-['Cairo',_'Segoe_UI',_'Tahoma',_sans-serif]">
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-red-200 shadow-2xl w-full max-w-md">
          <CardContent className="p-6 sm:p-8 text-center">
            <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-3 sm:mb-4">غير مصرح</h2>
            <p className="text-base sm:text-lg text-red-600 mb-4 sm:mb-6">هذه الصفحة متاحة فقط للمديرين</p>
            <Button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBackup = () => {
    setIsBackingUp(true);
    
    try {
      // إنشاء ملف النسخة الاحتياطية
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        records: records,
        metadata: {
          totalRecords: records.length,
          exportedBy: currentUser.name,
          exportedAt: new Date().toLocaleString('ar-EG')
        }
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `backup_inspection_records_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast({
        title: "تم إنشاء النسخة الاحتياطية بنجاح",
        description: `تم تصدير ${records.length} محضر تفتيش`,
      });
    } catch (error) {
      toast({
        title: "خطأ في إنشاء النسخة الاحتياطية",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        
        // التحقق من صحة البيانات
        if (!backupData.records || !Array.isArray(backupData.records)) {
          throw new Error('ملف النسخة الاحتياطية غير صالح');
        }

        // إضافة المحاضر المستعادة
        backupData.records.forEach((record: any) => {
          addRecord(record);
        });
        
        toast({
          title: "تم استعادة البيانات بنجاح",
          description: `تم استعادة ${backupData.records.length} محضر تفتيش`,
        });
      } catch (error) {
        toast({
          title: "خطأ في استعادة البيانات",
          description: "ملف النسخة الاحتياطية غير صالح أو تالف",
          variant: "destructive",
        });
      } finally {
        setIsRestoring(false);
        // إعادة تعيين قيمة input
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-['Cairo',_'Segoe_UI',_'Tahoma',_sans-serif]">
      <div className="bg-white shadow-xl border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="hover:bg-blue-100 transition-colors shadow-md border-2 border-blue-200">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للرئيسية
              </Button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">النسخ الاحتياطي واستعادة البيانات</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* معلومات النظام */}
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-2xl mb-6 sm:mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-right flex items-center font-bold text-gray-800">
              <Database className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              معلومات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{records.length}</div>
                <div className="text-sm sm:text-lg text-gray-700 font-semibold">إجمالي المحاضر</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-green-50 rounded-xl border-2 border-green-200">
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2 break-words">{currentUser?.name}</div>
                <div className="text-sm sm:text-lg text-gray-700 font-semibold">المدير الحالي</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-purple-50 rounded-xl border-2 border-purple-200 sm:col-span-2 lg:col-span-1">
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">{new Date().toLocaleDateString('ar-EG')}</div>
                <div className="text-sm sm:text-lg text-gray-700 font-semibold">التاريخ الحالي</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* النسخ الاحتياطي */}
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-2xl mb-6 sm:mb-8">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-right flex items-center font-bold text-gray-800">
              <Download className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              إنشاء نسخة احتياطية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="text-center">
              <div className="mb-4 sm:mb-6">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-green-600" />
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-3 sm:mb-4 px-2">
                  قم بإنشاء نسخة احتياطية من جميع محاضر التفتيش المحفوظة في النظام
                </p>
                <p className="text-sm text-gray-500 px-2">
                  سيتم تصدير البيانات في ملف JSON يحتوي على جميع المعلومات
                </p>
              </div>
              <Button
                onClick={handleBackup}
                disabled={isBackingUp}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-xl hover:shadow-2xl transition-all"
              >
                {isBackingUp ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white ml-2"></div>
                    <span className="text-sm sm:text-base">جاري إنشاء النسخة الاحتياطية...</span>
                  </div>
                ) : (
                  <>
                    <Download className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">إنشاء نسخة احتياطية</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* استعادة البيانات */}
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-right flex items-center font-bold text-gray-800">
              <Upload className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              استعادة البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="text-center">
              <div className="mb-4 sm:mb-6">
                <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-orange-600" />
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-3 sm:mb-4 px-2">
                  قم بتحميل ملف النسخة الاحتياطية لاستعادة البيانات
                </p>
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 mx-2">
                  <p className="text-sm text-red-600 font-semibold">
                    تحذير: استعادة البيانات ستضيف المحاضر إلى المحاضر الحالية
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  disabled={isRestoring}
                  className="hidden"
                  id="restore-file"
                />
                <label
                  htmlFor="restore-file"
                  className={`w-full sm:w-auto cursor-pointer inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg shadow-xl hover:shadow-2xl transition-all ${
                    isRestoring ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isRestoring ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white ml-2"></div>
                      <span className="text-sm sm:text-base">جاري استعادة البيانات...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">اختيار ملف النسخة الاحتياطية</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
