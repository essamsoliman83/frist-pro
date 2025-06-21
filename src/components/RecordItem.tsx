import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, User, Building2, Trash2, ArrowRight, Printer, Paperclip, Download } from 'lucide-react';
import { RecordPreview } from '@/components/RecordPreview';
import { printRecord } from '@/utils/exportUtils';
import { toast } from 'sonner';
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
import { 
  hasAttachments, 
  getAttachmentsCount, 
  downloadAllAttachments,
  createAttachmentIndicator,
  getRecordAttachments
} from '@/utils/attachmentUtils';

interface RecordItemProps {
  record: any;
  onRecordClick: (record: any) => void;
  onDeleteRecord?: (recordId: string, serialNumber: string) => void;
  showDeleteButton?: boolean;
}

export const RecordItem: React.FC<RecordItemProps> = ({
  record,
  onRecordClick,
  onDeleteRecord,
  showDeleteButton = false
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [attachmentInfo, setAttachmentInfo] = useState<any>(null);

  // تحديث معلومات المرفقات عند تحميل المكون
  useEffect(() => {
    if (record.id) {
      console.log('RecordItem: Checking attachments for record:', record.id);
      const info = createAttachmentIndicator(record.id);
      console.log('RecordItem: Attachment info:', info);
      setAttachmentInfo(info);
      
      // إضافة معلومات تفصيلية للتشخيص
      const attachments = getRecordAttachments(record.id);
      console.log('RecordItem: Raw attachments data:', attachments);
    }
  }, [record.id]);

  const handleRecordClick = () => {
    setShowPreview(true);
  };

  const handleBackToList = () => {
    setShowPreview(false);
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Print button clicked for record:', record.serialNumber);
    
    try {
      printRecord(record);
    } catch (error) {
      console.error('Print error:', error);
      alert('حدث خطأ أثناء الطباعة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleAttachmentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('RecordItem: Attachments download clicked for record:', record.serialNumber);
    
    if (!record.id) {
      toast.error('معرف المحضر غير صحيح');
      return;
    }
    
    downloadAllAttachments(record.id);
  };

  const handleDeleteClick = () => {
    if (onDeleteRecord) {
      onDeleteRecord(record.id, record.serialNumber);
    }
  };

  // If preview is active, show the RecordPreview component
  if (showPreview) {
    return (
      <div className="space-y-4">
        <Button onClick={handleBackToList} variant="outline" className="flex items-center">
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة لقائمة المحاضر
        </Button>
        <RecordPreview
          formData={record}
          serialNumber={record.serialNumber}
          onBack={handleBackToList}
          onSave={() => {}} // Empty function since this is view-only
          isViewMode={true}
          showPrintButton={true}
        />
      </div>
    );
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="text-right flex-1 cursor-pointer" onClick={handleRecordClick}>
          <div className="flex items-center justify-end mb-2">
            <span className="text-lg font-semibold text-blue-600 ml-2">
              {record.serialNumber}
            </span>
            <FileText className="h-5 w-5 text-blue-600" />
            
            {/* مؤشر المرفقات المحسن */}
            {attachmentInfo && (
              <div className="mr-2 flex items-center bg-green-50 rounded-lg px-3 py-1.5 border border-green-200 shadow-sm">
                <Paperclip className="h-4 w-4 text-green-600 ml-1" />
                <span className="text-sm text-green-700 font-semibold">
                  {attachmentInfo.label}
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
            <div className="flex items-center justify-end">
              <span className="ml-2">{record.basicData.date}</span>
              <Calendar className="h-4 w-4" />
            </div>
            
            <div className="flex items-center justify-end">
              <span className="ml-2">
                {Array.isArray(record.basicData.inspectorName) 
                  ? record.basicData.inspectorName.join(', ')
                  : record.basicData.inspectorName}
              </span>
              <User className="h-4 w-4" />
            </div>
            
            <div className="flex items-center justify-end">
              <span className="ml-2">
                {Array.isArray(record.basicData.workPlace) 
                  ? record.basicData.workPlace.join(', ')
                  : record.basicData.workPlace}
              </span>
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          
          <div className="mt-2 text-sm">
            <div className="text-right"><strong>المؤسسة:</strong> {record.basicData.institutionName}</div>
            <div className="text-right"><strong>مكان التفتيش:</strong> {record.basicData.inspectionLocation}</div>
          </div>
        </div>
        
        <div className="mr-4 flex flex-col gap-2">
          {/* زر تحميل المرفقات */}
          {attachmentInfo && (
            <Button
              onClick={handleAttachmentsClick}
              variant="outline"
              size="sm"
              className="flex items-center bg-green-50 hover:bg-green-100 text-green-700 border-green-200 shadow-sm hover:shadow-md transition-all min-w-[90px]"
              title={`تحميل ${attachmentInfo.count} مرفق`}
            >
              <Download className="h-4 w-4 ml-1" />
              <Paperclip className="h-3 w-3 ml-1" />
              <span className="font-medium">{attachmentInfo.count}</span>
            </Button>
          )}
          
          {/* زر الطباعة */}
          <Button 
            onClick={handlePrint}
            variant="outline" 
            size="sm"
            className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-sm hover:shadow-md transition-all"
          >
            <Printer className="h-4 w-4 ml-1" />
            طباعة
          </Button>
          
          {showDeleteButton && onDeleteRecord && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="text-right">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-right">تأكيد حذف المحضر</AlertDialogTitle>
                  <AlertDialogDescription className="text-right">
                    هل أنت متأكد من رغبتك في حذف المحضر رقم <strong>{record.serialNumber}</strong>؟
                    <br />
                    <span className="text-red-600 font-semibold">
                      سيتم حذف جميع البيانات والمرفقات المرتبطة بهذا المحضر نهائياً ولا يمكن التراجع عن هذا الإجراء.
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex justify-start space-x-2 space-x-reverse">
                  <AlertDialogCancel className="ml-2">إلغاء</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteClick}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    تأكيد الحذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </Card>
  );
};
