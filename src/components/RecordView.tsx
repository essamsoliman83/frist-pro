import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Printer, Home, Download, Paperclip, CheckCircle } from 'lucide-react';
import { RecordPreview } from '@/components/RecordPreview';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  getRecordAttachments, 
  downloadAttachment, 
  downloadAllAttachments 
} from '@/utils/attachmentUtils';

export const RecordView: React.FC = () => {
  const [recordData, setRecordData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [downloadedAttachments, setDownloadedAttachments] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    console.log('RecordView: Loading record data...');
    
    const getRecordData = () => {
      const viewRecord = localStorage.getItem('viewRecord');
      console.log('RecordView: viewRecord from localStorage:', viewRecord);
      
      if (viewRecord && viewRecord !== 'undefined' && viewRecord !== 'null') {
        try {
          const parsedRecord = JSON.parse(viewRecord);
          console.log('RecordView: Successfully parsed viewRecord:', parsedRecord);
          if (parsedRecord && parsedRecord.id) {
            return parsedRecord;
          }
        } catch (error) {
          console.error('RecordView: Error parsing viewRecord:', error);
        }
      }
      
      const selectedRecord = localStorage.getItem('selectedRecord');
      console.log('RecordView: selectedRecord from localStorage:', selectedRecord);
      
      if (selectedRecord && selectedRecord !== 'undefined' && selectedRecord !== 'null') {
        try {
          const parsedRecord = JSON.parse(selectedRecord);
          console.log('RecordView: Successfully parsed selectedRecord:', parsedRecord);
          if (parsedRecord && parsedRecord.id) {
            return parsedRecord;
          }
        } catch (error) {
          console.error('RecordView: Error parsing selectedRecord:', error);
        }
      }
      
      const sessionRecord = sessionStorage.getItem('currentRecord');
      if (sessionRecord && sessionRecord !== 'undefined' && sessionRecord !== 'null') {
        try {
          const parsedRecord = JSON.parse(sessionRecord);
          console.log('RecordView: Found record in sessionStorage:', parsedRecord);
          if (parsedRecord && parsedRecord.id) {
            return parsedRecord;
          }
        } catch (error) {
          console.error('RecordView: Error parsing session record:', error);
        }
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const recordId = urlParams.get('id');
      console.log('RecordView: Trying to get record by ID from URL:', recordId);
      
      if (recordId) {
        const allRecords = localStorage.getItem('pharmacy_inspection_records');
        if (allRecords) {
          try {
            const records = JSON.parse(allRecords);
            const foundRecord = records.find((record: any) => record.id === recordId);
            console.log('RecordView: Found record by ID:', foundRecord);
            if (foundRecord) {
              return foundRecord;
            }
          } catch (error) {
            console.error('RecordView: Error parsing all records:', error);
          }
        }
      }
      
      return null;
    };

    const recordData = getRecordData();
    
    if (recordData) {
      console.log('RecordView: Setting record data:', recordData);
      setRecordData(recordData);
      
      // تحميل المرفقات باستخدام النظام الجديد
      if (recordData.id) {
        console.log('RecordView: Loading attachments for record:', recordData.id);
        const recordAttachments = getRecordAttachments(recordData.id);
        console.log('RecordView: Found attachments:', recordAttachments);
        setAttachments(recordAttachments);
      }
    } else {
      console.error('RecordView: No valid record data found');
      setTimeout(() => {
        const retryData = getRecordData();
        if (retryData) {
          setRecordData(retryData);
        }
      }, 500);
    }
    
    setIsLoading(false);
  }, []);

  const handleBack = () => {
    console.log('RecordView: Going back');
    localStorage.removeItem('viewRecord');
    sessionStorage.removeItem('currentRecord');
    
    if (window.opener) {
      window.close();
    } else {
      window.history.back();
    }
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handlePrint = () => {
    console.log('RecordView: Printing record');
    
    if (!recordData) {
      console.error('RecordView: No record data for printing');
      toast.error('لا توجد بيانات للطباعة');
      return;
    }

    const printStyles = `
      <style>
        @media print {
          .no-print { display: none !important; }
          body { 
            -webkit-print-color-adjust: exact; 
            color-adjust: exact;
            font-family: 'Times New Roman', serif;
            direction: rtl;
            font-size: 12pt;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
          }
          .print-page-break { page-break-before: always; }
          h1, h2, h3 { color: black !important; }
          .border { border: 1px solid black !important; }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 10px 0;
          }
          th, td { 
            border: 1px solid black !important; 
            padding: 8px; 
            text-align: right; 
            font-size: 11pt;
          }
          .bg-gray-50, .bg-blue-50, .bg-red-50, .bg-yellow-50 {
            background-color: #f9f9f9 !important;
          }
          .text-blue-600, .text-red-600, .text-yellow-600, .text-blue-700 {
            color: black !important;
          }
          .shadow-xl, .shadow-lg, .shadow-sm {
            box-shadow: none !important;
          }
          .rounded-lg {
            border-radius: 0 !important;
          }
        }
      </style>
    `;
    
    const originalHead = document.head.innerHTML;
    document.head.innerHTML += printStyles;
    
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.head.innerHTML = originalHead;
      }, 100);
    }, 250);
  };

  const handleDownloadAttachment = (attachment: any) => {
    console.log('RecordView: Downloading single attachment:', attachment.name);
    
    const success = downloadAttachment(attachment);
    if (success) {
      setDownloadedAttachments(prev => new Set([...prev, attachment.name]));
    }
  };

  const handleDownloadAllAttachments = () => {
    console.log('RecordView: Starting bulk download');
    
    if (!recordData?.id) {
      toast.error('معرف المحضر غير صحيح');
      return;
    }
    
    downloadAllAttachments(recordData.id);
    
    // تحديث حالة التحميلات
    setTimeout(() => {
      const allNames = attachments.map(att => att.name);
      setDownloadedAttachments(new Set(allNames));
    }, attachments.length * 500 + 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-900">جاري تحميل المحضر...</h1>
        </div>
      </div>
    );
  }

  if (!recordData || !recordData.id) {
    console.error('RecordView: No record data available, recordData:', recordData);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">لا توجد بيانات للعرض</h1>
          <p className="text-gray-600 mb-4">يرجى المحاولة مرة أخرى من صفحة البحث</p>
          <div className="space-x-2">
            <Button onClick={handleBack}>العودة</Button>
            <Button onClick={handleHomeNavigation} variant="outline">
              <Home className="ml-2 h-4 w-4" />
              الصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log('RecordView: Rendering record with data:', recordData);

  return (
    <div className="min-h-screen bg-white">
      {/* Toolbar */}
      <div className="bg-white shadow-sm border-b no-print sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button onClick={handleBack} variant="ghost">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة
              </Button>
              <Button onClick={handleHomeNavigation} variant="outline">
                <Home className="ml-2 h-4 w-4" />
                الرئيسية
              </Button>
              <h1 className="text-xl font-bold text-gray-900">عرض المحضر</h1>
              {recordData.serialNumber && (
                <span className="text-sm text-gray-600">
                  رقم المحضر: {recordData.serialNumber}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              {attachments.length > 0 && (
                <Button 
                  onClick={handleDownloadAllAttachments}
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  <Download className="ml-2 h-4 w-4" />
                  تحميل جميع المرفقات ({attachments.length})
                  {downloadedAttachments.size > 0 && (
                    <span className="mr-1 text-green-200">
                      ({downloadedAttachments.size} تم)
                    </span>
                  )}
                </Button>
              )}
              
              <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                <Printer className="ml-2 h-4 w-4" />
                طباعة
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Attachments display */}
      {attachments.length > 0 && (
        <div className="bg-blue-50 border-b no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center text-blue-700">
                <Paperclip className="h-5 w-5 ml-2" />
                <span className="font-semibold">المرفقات ({attachments.length}):</span>
                {downloadedAttachments.size > 0 && (
                  <span className="mr-2 text-green-600 font-medium">
                    {downloadedAttachments.size} تم تحميله ✓
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => {
                  const isDownloaded = downloadedAttachments.has(attachment.name);
                  
                  return (
                    <Button
                      key={index}
                      onClick={() => handleDownloadAttachment(attachment)}
                      variant="outline"
                      size="sm"
                      className={`${
                        isDownloaded 
                          ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700' 
                          : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-700'
                      }`}
                    >
                      {isDownloaded ? (
                        <CheckCircle className="ml-1 h-3 w-3 text-green-600" />
                      ) : (
                        <FileText className="ml-1 h-3 w-3" />
                      )}
                      {attachment.name}
                      {isDownloaded && (
                        <span className="mr-1 text-green-600 font-bold">✓</span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record content */}
      <div className="p-4">
        <RecordPreview
          formData={recordData}
          serialNumber={recordData.serialNumber || `INS-${Date.now()}`}
          onBack={handleBack}
          onSave={() => {}}
          isViewMode={true}
          showPrintButton={true}
        />
      </div>
    </div>
  );
};
