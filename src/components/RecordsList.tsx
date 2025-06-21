import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileBarChart, Calendar, User, Building2, CheckSquare, Square, ArrowRight, Printer } from 'lucide-react';
import { RecordPreview } from '@/components/RecordPreview';
import { ExportModal } from '@/components/ExportModal';

interface RecordsListProps {
  records: any[];
  isMyView: boolean;
  onRecordClick: (record: any) => void;
  onExportToPDF: () => void;
  selectedRecords?: Set<string>;
  onToggleRecord?: (recordId: string) => void;
}

export const RecordsList: React.FC<RecordsListProps> = ({
  records,
  isMyView,
  onRecordClick,
  onExportToPDF,
  selectedRecords = new Set(),
  onToggleRecord
}) => {
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const getViolationCount = (record: any) => {
    let count = 0;
    if (record.inspectionResults) {
      Object.values(record.inspectionResults).forEach(items => {
        if (Array.isArray(items)) {
          count += items.length;
        }
      });
    }
    return count;
  };

  const handleRecordClick = (record: any) => {
    setSelectedRecord(record);
  };

  const handleBackToList = () => {
    setSelectedRecord(null);
  };

  const handlePrintRecord = (record: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // فتح نافذة جديدة للطباعة
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePrintHTML(record);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const generatePrintHTML = (record: any) => {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>محضر تفتيش صيدلي - ${record.serialNumber}</title>
        <style>
          body { 
            font-family: 'Times New Roman', serif; 
            margin: 20px; 
            direction: rtl; 
            text-align: right;
            line-height: 1.6;
            font-size: 14px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2563eb;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .intro-text {
            background-color: #f9f9f9;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            line-height: 2;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #333; 
            padding: 8px; 
            text-align: right;
          }
          th { 
            background-color: #f3f4f6; 
            font-weight: bold;
          }
          .violation-section {
            margin-bottom: 20px;
            padding: 15px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
          }
          .signatures {
            margin-top: 60px;
            display: flex;
            justify-content: space-around;
          }
          .signature-box {
            text-align: center;
            border-top: 2px solid #000;
            padding-top: 10px;
            width: 200px;
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>محضر تفتيش صيدلي</h1>
          <p>رقم المحضر: ${record.serialNumber}</p>
        </div>
        
        <div class="intro-text">
          <p>إنه في يوم <strong>${record.basicData?.day || 'غير محدد'}</strong> الموافق <strong>${record.basicData?.date || 'غير محدد'}</strong> في تمام الساعة <strong>${record.basicData?.time || 'غير محدد'}</strong> قمنا نحن <strong>${Array.isArray(record.basicData?.inspectorName) ? record.basicData.inspectorName.join(', ') : record.basicData?.inspectorName || 'غير محدد'}</strong> من مفتشي <strong>${Array.isArray(record.basicData?.workPlace) ? record.basicData.workPlace.join(', ') : record.basicData?.workPlace || 'غير محدد'}</strong> بالمرور على <strong>${record.basicData?.institutionName || 'غير محدد'}</strong> <strong>${record.basicData?.inspectionLocation || ''}</strong>${record.basicData?.presentPharmacist ? ` وتقابلنا مع <strong>${record.basicData.presentPharmacist}</strong>` : ''} وكان المرور بناءً على <strong>${record.basicData?.inspectionReason || 'غير محدد'}</strong>.</p>
        </div>
        
        ${generateViolationsHTML(record)}
        
        ${record.recommendations && record.recommendations.trim() ? `
          <div class="violation-section">
            <h3 class="section-title">التوصيات:</h3>
            <p>${record.recommendations}</p>
          </div>
        ` : ''}
        
        <div class="signatures">
          <div class="signature-box">
            <p><strong>توقيع المفتش</strong></p>
          </div>
          <div class="signature-box">
            <p><strong>توقيع مدير التفتيش الصيدلي الحكومي</strong></p>
          </div>
          <div class="signature-box">
            <p><strong>توقيع مدير إدارة الصيدلة</strong></p>
          </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          <p>تم إنشاء هذا المحضر بتاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
          <p>نظام إدارة محاضر التفتيش الصيدلي - إدارة الصيدلة بكفرالشيخ</p>
        </div>
      </body>
      </html>
    `;
  };

  const generateViolationsHTML = (record: any) => {
    if (!record.inspectionResults) return '';
    
    let html = '';
    
    Object.entries(record.inspectionResults).forEach(([section, items]: [string, any]) => {
      if (section === 'inventoryManagement') {
        const inventoryData = items;
        const hasInventoryData = inventoryData && Object.values(inventoryData).some((arr: any) => Array.isArray(arr) && arr.length > 0);
        
        if (hasInventoryData) {
          html += '<div class="violation-section"><h3 class="section-title">إدارة المخزون</h3>';
          
          if (inventoryData.shortages && inventoryData.shortages.length > 0) {
            html += '<h4>النواقص</h4><table><thead><tr><th>الصنف</th><th>الوحدة</th><th>الكمية المطلوبة</th></tr></thead><tbody>';
            inventoryData.shortages.forEach((item: any) => {
              html += `<tr><td>${item.item}</td><td>${item.unit}</td><td>${item.requiredQuantity}</td></tr>`;
            });
            html += '</tbody></table>';
          }
          
          if (inventoryData.stagnant && inventoryData.stagnant.length > 0) {
            html += '<h4>الرواكد</h4><table><thead><tr><th>الصنف</th><th>الوحدة</th><th>الكمية</th><th>تاريخ الانتهاء</th></tr></thead><tbody>';
            inventoryData.stagnant.forEach((item: any) => {
              html += `<tr><td>${item.item}</td><td>${item.unit}</td><td>${item.quantity}</td><td>${item.expiryDate}</td></tr>`;
            });
            html += '</tbody></table>';
          }

          if (inventoryData.expired && inventoryData.expired.length > 0) {
            html += '<h4>منتهي الصلاحية</h4><table><thead><tr><th>الصنف</th><th>الوحدة</th><th>الكمية</th><th>تاريخ الانتهاء</th></tr></thead><tbody>';
            inventoryData.expired.forEach((item: any) => {
              html += `<tr><td>${item.item}</td><td>${item.unit}</td><td>${item.quantity}</td><td>${item.expiryDate}</td></tr>`;
            });
            html += '</tbody></table>';
          }

          if (inventoryData.randomInventory && inventoryData.randomInventory.length > 0) {
            html += '<h4>الجرد العشوائي</h4><table><thead><tr><th>الصنف</th><th>الوحدة</th><th>رصيد الدفتر</th><th>المصروف</th><th>الرصيد الفعلي</th><th>العجز</th><th>الزيادة</th></tr></thead><tbody>';
            inventoryData.randomInventory.forEach((item: any) => {
              html += `<tr><td>${item.item}</td><td>${item.unit}</td><td>${item.bookBalance}</td><td>${item.dispensed}</td><td>${item.actualBalance}</td><td>${item.shortage}</td><td>${item.surplus}</td></tr>`;
            });
            html += '</tbody></table>';
          }
          
          html += '</div>';
        }
      } else if (Array.isArray(items) && items.length > 0) {
        const sectionNames: { [key: string]: string } = {
          'humanResources': 'القوة البشرية',
          'documentsAndBooks': 'الدفاتر والمستندات',
          'dispensingPolicies': 'سياسات الصرف والقوائم',
          'storageAndHealth': 'الاشتراطات الصحية والتخزين',
          'securityAndSafety': 'الأمن والسلامة',
          'otherViolations': 'مخالفات أخرى'
        };
        
        html += `<div class="violation-section"><h3 class="section-title">${sectionNames[section] || section}</h3>`;
        items.forEach((item: any, index: number) => {
          html += `
            <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd;">
              <h4>المخالفة #${index + 1}</h4>
              <p><strong>المخالفة:</strong> ${item.violation}</p>
              <p><strong>الإجراء المتخذ:</strong> ${item.actionTaken}</p>
              <p><strong>المسؤول:</strong> ${item.responsible}</p>
            </div>
          `;
        });
        html += '</div>';
      }
    });
    
    return html;
  };

  const toggleSelectAll = () => {
    if (onToggleRecord) {
      if (selectedRecords.size === records.length) {
        // إلغاء تحديد الكل
        records.forEach(record => onToggleRecord(record.id));
      } else {
        // تحديد الكل
        records.forEach(record => {
          if (!selectedRecords.has(record.id)) {
            onToggleRecord(record.id);
          }
        });
      }
    }
  };

  const getSelectedRecordsData = () => {
    return records.filter(record => selectedRecords.has(record.id));
  };

  const handleExport = (format: 'pdf' | 'excel', options: any) => {
    const selectedRecordsData = getSelectedRecordsData();
    
    if (format === 'pdf') {
      exportToPDF(selectedRecordsData, options.fileName);
    } else {
      exportToExcel(selectedRecordsData, options.fileName);
    }
  };

  const exportToPDF = (records: any[], fileName: string) => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${fileName}</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 20px; 
            direction: rtl; 
            text-align: right;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2563eb;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .summary {
            background-color: #f3f4f6;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            font-size: 14px;
          }
          th, td { 
            border: 1px solid #d1d5db; 
            padding: 12px; 
            text-align: right;
          }
          th { 
            background-color: #f3f4f6; 
            font-weight: bold;
            color: #374151;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; font-size: 12px; }
            .header h1 { font-size: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${fileName}</h1>
          <p>تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        
        <div class="summary">
          <h2>ملخص التقرير</h2>
          <p><strong>عدد المحاضر المصدرة:</strong> ${records.length}</p>
          <p><strong>إجمالي المخالفات:</strong> ${records.reduce((total, record) => total + getViolationCount(record), 0)}</p>
        </div>
        
        <h2>جدول المحاضر</h2>
        <table>
          <thead>
            <tr>
              <th>رقم المحضر</th>
              <th>التاريخ</th>
              <th>اسم المفتش</th>
              <th>جهة العمل</th>
              <th>اسم المؤسسة</th>
              <th>مكان التفتيش</th>
              <th>عدد المخالفات</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(record => `
              <tr>
                <td>${record.serialNumber}</td>
                <td>${record.basicData.date}</td>
                <td>${Array.isArray(record.basicData.inspectorName) 
                  ? record.basicData.inspectorName.join(', ') 
                  : record.basicData.inspectorName}</td>
                <td>${Array.isArray(record.basicData.workPlace) 
                  ? record.basicData.workPlace.join(', ') 
                  : record.basicData.workPlace}</td>
                <td>${record.basicData.institutionName}</td>
                <td>${record.basicData.inspectionLocation}</td>
                <td>${getViolationCount(record)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>نظام إدارة محاضر التفتيش الصيدلي - إدارة الصيدلة بكفرالشيخ</p>
          <p>تم إنشاء هذا التقرير تلقائياً بتاريخ ${new Date().toLocaleString('ar-SA')}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const exportToExcel = (records: any[], fileName: string) => {
    const headers = [
      'رقم المحضر',
      'التاريخ', 
      'اسم المفتش',
      'جهة العمل',
      'اسم المؤسسة',
      'مكان التفتيش',
      'عدد المخالفات'
    ];
    
    const csvData = records.map(record => [
      record.serialNumber,
      record.basicData.date,
      Array.isArray(record.basicData.inspectorName) 
        ? record.basicData.inspectorName.join(' - ') 
        : record.basicData.inspectorName,
      Array.isArray(record.basicData.workPlace) 
        ? record.basicData.workPlace.join(' - ') 
        : record.basicData.workPlace,
      record.basicData.institutionName,
      record.basicData.inspectionLocation,
      getViolationCount(record)
    ]);
    
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // If a record is selected, show it in preview mode
  if (selectedRecord) {
    return (
      <div className="space-y-4">
        <Button onClick={handleBackToList} variant="outline" className="flex items-center">
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة لقائمة المحاضر
        </Button>
        <RecordPreview
          formData={selectedRecord}
          serialNumber={selectedRecord.serialNumber}
          onBack={handleBackToList}
          onSave={() => {}} // Empty function since this is view-only
          isViewMode={true}
          showPrintButton={true}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">تفاصيل المحاضر ({records.length})</CardTitle>
        <div className="flex items-center space-x-2 space-x-reverse">
          {!isMyView && records.length > 0 && (
            <Button
              variant="outline"
              onClick={toggleSelectAll}
              className="flex items-center"
            >
              {selectedRecords.size === records.length ? (
                <CheckSquare className="ml-2 h-4 w-4" />
              ) : (
                <Square className="ml-2 h-4 w-4" />
              )}
              {selectedRecords.size === records.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </Button>
          )}
          
          {!isMyView && selectedRecords.size > 0 && (
            <Button
              onClick={() => setIsExportModalOpen(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير المحدد ({selectedRecords.size})
            </Button>
          )}
          
          <Button onClick={onExportToPDF} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Download className="ml-2 h-4 w-4" />
            تصدير PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8">
            <FileBarChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {isMyView ? 'لا توجد محاضر خاصة بك' : 'لا توجد محاضر للفترة المحددة'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record: any) => (
              <div key={record.id} className="flex items-start space-x-4 space-x-reverse">
                {/* إظهار خانات التحديد فقط في البحث العام وليس في الأقسام الشخصية */}
                {onToggleRecord && !isMyView && (
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleRecord(record.id)}
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
                <Card 
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer flex-1"
                  onClick={() => handleRecordClick(record)}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-right flex-1">
                      <div className="flex items-center justify-end mb-2">
                        <span className="text-lg font-semibold text-blue-600 ml-2">
                          {record.serialNumber}
                        </span>
                        <FileBarChart className="h-5 w-5 text-blue-600" />
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
                        <div className="text-right"><strong>عدد المخالفات:</strong> {getViolationCount(record)}</div>
                      </div>
                    </div>
                    
                    {/* زر الطباعة */}
                    <div className="mr-4">
                      <Button 
                        onClick={(e) => handlePrintRecord(record, e)}
                        variant="outline" 
                        size="sm"
                        className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      >
                        <Printer className="h-4 w-4 ml-1" />
                        طباعة
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {!isMyView && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          selectedRecords={getSelectedRecordsData()}
          onExport={handleExport}
        />
      )}
    </Card>
  );
};
