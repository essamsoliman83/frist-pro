import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { InspectionRecord } from '@/types';
import { useInspectionRecords } from '@/hooks/useInspectionRecords';
import { useAuth } from '@/contexts/AuthContext';
import { SearchForm } from '@/components/SearchForm';
import { RecordItem } from '@/components/RecordItem';
import { RecordPreview } from '@/components/RecordPreview';
import { Button } from '@/components/ui/button';
import { FileText, Home, Download, CheckSquare, Square, Table, Paperclip, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getInspectorsByWorkplacesFromUsers } from '@/data/inspectors';
import { PREDEFINED_SUPERVISORY_WORKPLACES } from '@/types';
import { ExportModal } from '@/components/ExportModal';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useRecordSelection } from '@/hooks/useRecordSelection';
import { useRecordFiltering } from '@/hooks/useRecordFiltering';
import { exportInspectorReportToPDF, exportToExcel, exportToTableFormat } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { 
  hasAttachments, 
  getAttachmentsCount, 
  downloadAllAttachments,
  createAttachmentIndicator 
} from '@/utils/attachmentUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const SearchRecords: React.FC = () => {
  const { records, deleteRecord } = useInspectionRecords();
  const { currentUser, users } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: useToastHook } = useToast();
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const isMyRecordsView = searchParams.get('view') === 'my-records';

  const {
    filters,
    setFilters,
    updateFilter,
    handleReset,
    getAvailableInspectors,
    getAvailableWorkPlaces
  } = useSearchFilters(currentUser, users, isMyRecordsView);

  const { filteredRecords } = useRecordFiltering(records, filters, currentUser, isMyRecordsView);

  const {
    selectedRecords,
    toggleRecordSelection,
    toggleSelectAll,
    getSelectedRecordsData
  } = useRecordSelection(filteredRecords);

  // دالة محسنة للتعامل مع تحميل المرفقات
  const handleDownloadAttachments = (record: any, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('SearchRecords: Download attachments clicked for record:', record.serialNumber);
    
    if (!record.id) {
      toast.error('معرف المحضر غير صحيح');
      return;
    }
    
    downloadAllAttachments(record.id);
  };

  // دالة محسنة لحذف المحضر مع حذف المرفقات
  const handleDeleteRecord = (recordId: string, serialNumber: string) => {
    console.log(`Deleting record ${serialNumber} with ID: ${recordId}`);
    
    // حذف المرفقات المرتبطة بالمحضر
    const attachmentsKey = `attachments_${recordId}`;
    localStorage.removeItem(attachmentsKey);
    console.log(`Deleted attachments for record: ${recordId}`);
    
    // حذف المحضر من قاعدة البيانات
    deleteRecord(recordId);
    
    // إزالة المحضر من القائمة المحددة
    const newSelectedRecords = new Set(selectedRecords);
    newSelectedRecords.delete(recordId);
    
    // إظهار رسالة نجاح
    toast.success(`تم حذف المحضر ${serialNumber} وجميع مرفقاته نهائياً`);
    
    useToastHook({
      title: "تم حذف المحضر نهائياً",
      description: `تم حذف المحضر ${serialNumber} وجميع المرفقات المرتبطة به من جميع الحسابات والتقارير`,
      variant: "destructive",
    });
  };

  // Helper function to get attachments for a record
  const getRecordAttachments = (record: any) => {
    if (!record.id) return [];
    
    const attachmentsKey = `attachments_${record.id}`;
    const storedAttachments = localStorage.getItem(attachmentsKey);
    console.log('البحث عن المرفقات للمحضر:', record.id);
    console.log('مفتاح المرفقات:', attachmentsKey);
    console.log('المرفقات المخزنة:', storedAttachments);
    
    if (storedAttachments) {
      try {
        const parsedAttachments = JSON.parse(storedAttachments);
        console.log('المرفقات بعد التحليل:', parsedAttachments);
        
        const validAttachments = parsedAttachments.filter((attachment: any) => {
          return attachment && 
                 attachment.name && 
                 attachment.content && 
                 typeof attachment.content === 'string' &&
                 attachment.content.length > 0;
        });
        
        console.log('المرفقات الصحيحة:', validAttachments);
        return validAttachments;
      } catch (error) {
        console.error('خطأ في تحليل المرفقات:', error);
        return [];
      }
    }
    
    return [];
  };

  // Enhanced download function with better error handling
  const handleDownloadAttachment = (attachment: any) => {
    console.log('بدء تحميل المرفق:', attachment.name);
    console.log('محتوى المرفق:', attachment.content?.substring(0, 100) + '...');
    
    if (!attachment || !attachment.name || !attachment.content) {
      console.error('بيانات المرفق غير صحيحة');
      toast.error('بيانات المرفق غير صحيحة');
      return;
    }
    
    try {
      let downloadContent = attachment.content;
      
      // التأكد من صيغة data URL الصحيحة
      if (!downloadContent.startsWith('data:')) {
        const extension = attachment.name.split('.').pop()?.toLowerCase() || '';
        let mimeType = 'application/octet-stream';
        
        const mimeTypes: { [key: string]: string } = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'txt': 'text/plain',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        
        mimeType = mimeTypes[extension] || mimeType;
        downloadContent = `data:${mimeType};base64,${downloadContent}`;
      }
      
      console.log('تنسيق التحميل النهائي:', downloadContent.substring(0, 50) + '...');
      
      // إنشاء رابط التحميل
      const link = document.createElement('a');
      link.href = downloadContent;
      link.download = attachment.name;
      link.style.display = 'none';
      
      // إضافة الرابط للصفحة والنقر عليه
      document.body.appendChild(link);
      link.click();
      
      // تنظيف الرابط بعد فترة قصيرة
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 100);
      
      toast.success(`تم تحميل ${attachment.name} بنجاح ✓`);
      console.log('تم التحميل بنجاح:', attachment.name);
      
    } catch (error) {
      console.error('خطأ في تحميل المرفق:', error);
      toast.error(`خطأ في تحميل ${attachment.name}`);
    }
  };

  // Handle downloading attachments with improved functionality
  const handleDownloadAttachmentsOld = (record: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const attachments = getRecordAttachments(record);
    console.log('محاولة تحميل مرفقات المحضر:', record.serialNumber);
    console.log('عدد المرفقات:', attachments.length);
    
    if (attachments.length === 0) {
      toast.error('لا توجد مرفقات لهذا المحضر');
      return;
    }

    if (attachments.length === 1) {
      // إذا كان هناك مرفق واحد فقط، حمله مباشرة
      const attachment = attachments[0];
      handleDownloadAttachment(attachment);
    } else {
      // إذا كان هناك عدة مرفقات، حمل الكل
      toast.success(`جاري تحميل ${attachments.length} مرفق...`);
      attachments.forEach((attachment: any, index: number) => {
        setTimeout(() => {
          handleDownloadAttachment(attachment);
        }, index * 500); // تأخير 500ms بين كل تحميل
      });
    }
  };

  const getPageTitle = () => {
    if (isMyRecordsView) {
      return 'محاضري';
    }
    return currentUser?.role === 'inspector' ? 'محاضري' : 'محاضر المفتشين';
  };

  const getPageDescription = () => {
    if (isMyRecordsView) {
      return 'عرض محاضر التفتيش الخاصة بي';
    }
    return currentUser?.role === 'inspector' ? 'عرض محاضر التفتيش الخاصة بي' : 'ابحث في محاضر التفتيش باستخدام معايير مختلفة';
  };

  const handleExport = (format: 'pdf' | 'excel', options: any) => {
    const selectedRecordsData = getSelectedRecordsData();
    
    if (format === 'pdf') {
      exportInspectorReportToPDF(selectedRecordsData, options.fileName);
    } else {
      exportToExcel(selectedRecordsData, options.fileName);
    }
    
    useToastHook({
      title: "تم التصدير بنجاح",
      description: `تم تصدير ${selectedRecordsData.length} محضر بصيغة ${format.toUpperCase()}`,
    });
  };

  const handleTableExport = () => {
    const selectedRecordsData = getSelectedRecordsData();
    const fileName = `تقرير_جدول_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '_')}`;
    
    exportToTableFormat(selectedRecordsData, fileName);
    
    useToastHook({
      title: "تم التصدير بنجاح",
      description: `تم تصدير ${selectedRecordsData.length} محضر في شكل جدول`,
    });
  };

  const showMultiSelectFields = currentUser && currentUser.role !== 'inspector' && !isMyRecordsView;
  const shouldShowDeleteButton = currentUser?.role === 'manager' && !isMyRecordsView;

  if (selectedRecord) {
    return (
      <RecordPreview 
        formData={selectedRecord}
        serialNumber={selectedRecord.serialNumber}
        onBack={() => setSelectedRecord(null)}
        onSave={() => {}}
        isViewMode={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => navigate('/')} variant="outline" className="flex items-center">
          <Home className="ml-2 h-4 w-4" />
          العودة للرئيسية
        </Button>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
        <p className="text-gray-600">{getPageDescription()}</p>
      </div>

      <SearchForm 
        filters={filters}
        onFilterChange={updateFilter}
        onSearch={() => {}}
        onReset={handleReset}
        showMultiSelectFields={showMultiSelectFields}
        showInspectorNameField={!(isMyRecordsView || currentUser?.role === 'inspector')}
        availableWorkPlaces={getAvailableWorkPlaces()}
        availableInspectors={getAvailableInspectors()}
        isMyView={isMyRecordsView || currentUser?.role === 'inspector'}
        currentUser={currentUser}
      />

      <div className="grid gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-right">نتائج البحث ({filteredRecords.length})</h2>
          
          {filteredRecords.length > 0 && !(isMyRecordsView || currentUser?.role === 'inspector') && (
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="outline"
                onClick={() => toggleSelectAll()}
                className="flex items-center"
              >
                {selectedRecords.size === filteredRecords.length ? (
                  <CheckSquare className="ml-2 h-4 w-4" />
                ) : (
                  <Square className="ml-2 h-4 w-4" />
                )}
                {selectedRecords.size === filteredRecords.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </Button>
              
              {selectedRecords.size > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button
                    onClick={handleTableExport}
                    variant="outline"
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                  >
                    <Table className="ml-2 h-4 w-4" />
                    تصدير جدول ({selectedRecords.size})
                  </Button>
                  
                  <Button
                    onClick={() => setIsExportModalOpen(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Download className="ml-2 h-4 w-4" />
                    تصدير تقرير ({selectedRecords.size})
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {filteredRecords.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {(isMyRecordsView || currentUser?.role === 'inspector') ? 'لا توجد محاضر خاصة بك' : 'لا توجد نتائج للبحث'}
            </p>
          </Card>
        ) : (
          filteredRecords.map((record) => {
            // استخدام النظام الجديد للتحقق من المرفقات
            const attachmentInfo = createAttachmentIndicator(record.id);
            
            return (
              <div key={record.id} className="flex items-start space-x-4 space-x-reverse">
                {!(isMyRecordsView || currentUser?.role === 'inspector') && (
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRecordSelection(record.id)}
                      className="p-2"
                    >
                      {selectedRecords.has(record.id) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                )}
                
                <div className="flex-1">
                  <RecordItem
                    record={record}
                    onRecordClick={setSelectedRecord}
                    onDeleteRecord={shouldShowDeleteButton ? handleDeleteRecord : undefined}
                    showDeleteButton={shouldShowDeleteButton}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {!(isMyRecordsView || currentUser?.role === 'inspector') && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          selectedRecords={getSelectedRecordsData()}
          onExport={handleExport}
        />
      )}
    </div>
  );
};
