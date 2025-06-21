
import React from 'react';
import { InspectionRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Download } from 'lucide-react';
import { useInspectionRecords } from '@/hooks/useInspectionRecords';

interface RecordDetailsProps {
  record: InspectionRecord;
  onBack: () => void;
}

export const RecordDetails: React.FC<RecordDetailsProps> = ({ record, onBack }) => {
  const { toString } = useInspectionRecords();
  
  console.log('RecordDetails component rendered with record:', record);

  // دالة لإضافة صباحاً أو مساءً للوقت
  const formatTimeWithPeriod = (time: string) => {
    if (!time) return '';
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'صباحاً' : 'مساءً';
    return `${time} ${period}`;
  };

  const exportToPDF = () => {
    console.log('Exporting PDF for record:', record.serialNumber);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>محضر تفتيش رقم ${record.serialNumber}</title>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { 
            font-family: 'Amiri', 'Times New Roman', serif; 
            direction: rtl; 
            padding: 10px; 
            font-size: 16px; 
            line-height: 1.6;
          }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .section { margin-bottom: 25px; }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
            font-size: 14px; 
            border: 2px solid #333;
          }
          .table th, .table td { 
            border: 1px solid #333; 
            padding: 8px; 
            text-align: right; 
            font-weight: normal;
          }
          .table th { 
            background-color: #f0f0f0; 
            font-weight: bold;
            font-size: 15px;
          }
          .signatures { 
            display: flex; 
            justify-content: space-around; 
            gap: 20px; 
            margin-top: 50px; 
            text-align: center; 
          }
          .signature-line { 
            border-top: 2px solid #000; 
            padding-top: 10px; 
            font-size: 14px; 
            font-weight: bold;
            flex: 1;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 1px solid #666;
            padding-bottom: 5px;
          }
          @media (max-width: 768px) {
            body { padding: 5px; font-size: 14px; }
            .signatures { flex-direction: column; gap: 15px; }
            .table th, .table td { padding: 4px; font-size: 12px; }
            .header h1 { font-size: 22px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>محضر تفتيش صيدلي</h1>
          <p style="font-size: 18px; font-weight: bold;">رقم المحضر: ${record.serialNumber}</p>
          <p style="font-size: 16px;">التاريخ: ${record.basicData.date}</p>
        </div>

        <div class="section">
          <p style="text-align: justify; font-size: 16px; line-height: 1.8;">
            إنه في يوم <strong>${record.basicData.day}</strong> الموافق <strong>${record.basicData.date}</strong> في تمام الساعة <strong>${formatTimeWithPeriod(record.basicData.time)}</strong>
            قمنا نحن <strong>${toString(record.basicData.inspectorName)}</strong> من مفتشي <strong>${toString(record.basicData.workPlace)}</strong>
            بالمرور على <strong>${record.basicData.institutionName}</strong> <strong>${record.basicData.inspectionLocation}</strong>
            وكان المرور بناءً على <strong>${record.basicData.inspectionReason}</strong>.
          </p>
        </div>

        ${Object.entries(record.inspectionResults).map(([section, items]) => {
          if (section === 'inventoryManagement') {
            const inventoryData = items as any;
            const hasInventoryData = Object.values(inventoryData).some((arr: any) => Array.isArray(arr) && arr.length > 0);
            
            if (!hasInventoryData) return '';
            
            let inventoryHTML = '<div class="section"><div class="section-title">إدارة المخزون</div>';
            
            if (inventoryData.shortages && inventoryData.shortages.length > 0) {
              inventoryHTML += `
                <h3 style="font-size: 18px; margin: 15px 0 10px 0; color: #d32f2f;">النواقص</h3>
                <table class="table">
                  <thead>
                    <tr style="background-color: #ffebee;">
                      <th>الصنف</th>
                      <th>الوحدة</th>
                      <th>الكمية المطلوبة</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${inventoryData.shortages.map((item: any) => `
                      <tr>
                        <td>${item.item}</td>
                        <td>${item.unit}</td>
                        <td>${item.requiredQuantity}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `;
            }
            
            if (inventoryData.stagnant && inventoryData.stagnant.length > 0) {
              inventoryHTML += `
                <h3 style="font-size: 18px; margin: 15px 0 10px 0; color: #f57c00;">الرواكد</h3>
                <table class="table">
                  <thead>
                    <tr style="background-color: #fff8e1;">
                      <th>الصنف</th>
                      <th>الوحدة</th>
                      <th>الكمية</th>
                      <th>تاريخ الانتهاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${inventoryData.stagnant.map((item: any) => `
                      <tr>
                        <td>${item.item}</td>
                        <td>${item.unit}</td>
                        <td>${item.quantity}</td>
                        <td>${item.expiryDate}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `;
            }
            
            if (inventoryData.expired && inventoryData.expired.length > 0) {
              inventoryHTML += `
                <h3 style="font-size: 18px; margin: 15px 0 10px 0; color: #d32f2f;">منتهي الصلاحية</h3>
                <table class="table">
                  <thead>
                    <tr style="background-color: #ffebee;">
                      <th>الصنف</th>
                      <th>الوحدة</th>
                      <th>الكمية</th>
                      <th>تاريخ الانتهاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${inventoryData.expired.map((item: any) => `
                      <tr>
                        <td>${item.item}</td>
                        <td>${item.unit}</td>
                        <td>${item.quantity}</td>
                        <td>${item.expiryDate}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `;
            }
            
            if (inventoryData.randomInventory && inventoryData.randomInventory.length > 0) {
              inventoryHTML += `
                <h3 style="font-size: 18px; margin: 15px 0 10px 0; color: #1976d2;">الجرد العشوائي</h3>
                <table class="table" style="font-size: 12px;">
                  <thead>
                    <tr style="background-color: #e3f2fd;">
                      <th>الصنف</th>
                      <th>الوحدة</th>
                      <th>رصيد الدفتر</th>
                      <th>المصروف</th>
                      <th>الرصيد الفعلي</th>
                      <th>العجز</th>
                      <th>الزيادة</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${inventoryData.randomInventory.map((item: any) => `
                      <tr>
                        <td>${item.item}</td>
                        <td>${item.unit}</td>
                        <td>${item.bookBalance}</td>
                        <td>${item.dispensed}</td>
                        <td>${item.actualBalance}</td>
                        <td>${item.shortage}</td>
                        <td>${item.surplus}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `;
            }
            
            inventoryHTML += '</div>';
            return inventoryHTML;
          }
          
          if (!Array.isArray(items) || items.length === 0) return '';
          
          const sectionTitle = {
            humanResources: 'القوة البشرية',
            documentsAndBooks: 'الدفاتر والمستندات',
            dispensingPolicies: 'سياسات الصرف والقوائم',
            storageAndHealth: 'الاشتراطات الصحية والتخزين',
            securityAndSafety: 'الأمن والسلامة',
            otherViolations: 'مخالفات أخرى'
          }[section];

          return `
            <div class="section">
              <div class="section-title">${sectionTitle}</div>
              <table class="table">
                <thead>
                  <tr>
                    <th>المخالفة</th>
                    <th>الإجراء المتخذ</th>
                    <th>المسؤول</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item: any) => `
                    <tr>
                      <td>${item.violation}</td>
                      <td>${item.actionTaken}</td>
                      <td>${item.responsible}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        }).join('')}

        ${record.recommendations ? `
          <div class="section">
            <div class="section-title">التوصيات:</div>
            <p style="text-align: justify; font-size: 16px; line-height: 1.7;">${record.recommendations}</p>
          </div>
        ` : ''}

        <div class="signatures">
          <div class="signature-line">توقيع المفتش</div>
          <div class="signature-line">توقيع مدير التفتيش الصيدلي الحكومي</div>
          <div class="signature-line">توقيع مدير إدارة الصيدلة</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (!record) {
    console.error('No record provided to RecordDetails component');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 font-['Amiri',_'Times_New_Roman',_serif]">
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-2xl w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-xl text-gray-600">لا توجد بيانات للعرض</p>
            <Button onClick={onBack} className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
              <ArrowRight className="ml-2 h-5 w-5" />
              العودة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-['Amiri',_'Times_New_Roman',_serif]">
      <div className="bg-white shadow-xl border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button onClick={onBack} variant="ghost" size="lg" className="hover:bg-blue-100 transition-colors shadow-md border-2 border-blue-200">
                <ArrowRight className="ml-2 h-5 w-5" />
                العودة
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
                تفاصيل المحضر {record.serialNumber}
              </h1>
            </div>
            <Button onClick={exportToPDF} variant="outline" size="lg" className="w-full sm:w-auto shadow-lg border-2 border-green-300 hover:bg-green-50 transition-all">
              <Download className="ml-2 h-5 w-5" />
              تصدير PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-2xl mb-8">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <CardTitle className="text-xl md:text-2xl text-right font-bold text-gray-800">البيانات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="space-y-2">
                <p className="font-bold text-gray-600 text-lg">رقم المحضر</p>
                <p className="text-xl md:text-2xl text-blue-700 font-semibold break-words">{record.serialNumber}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-600 text-lg">اليوم</p>
                <p className="text-xl md:text-2xl text-gray-800">{record.basicData.day}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-600 text-lg">التاريخ</p>
                <p className="text-xl md:text-2xl text-gray-800">{record.basicData.date}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-600 text-lg">الوقت</p>
                <p className="text-xl md:text-2xl text-gray-800">{formatTimeWithPeriod(record.basicData.time)}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-600 text-lg">المفتش</p>
                <p className="text-xl md:text-2xl text-gray-800 break-words">{toString(record.basicData.inspectorName)}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-600 text-lg">جهة العمل</p>
                <p className="text-xl md:text-2xl text-gray-800 break-words">{toString(record.basicData.workPlace)}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-600 text-lg">المؤسسة</p>
                <p className="text-xl md:text-2xl text-gray-800 break-words">{record.basicData.institutionName}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-600 text-lg">مكان التفتيش</p>
                <p className="text-xl md:text-2xl text-gray-800 break-words">{record.basicData.inspectionLocation}</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-600 text-lg">سبب التفتيش</p>
                <p className="text-xl md:text-2xl text-gray-800 break-words">{record.basicData.inspectionReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* نتائج التفتيش */}
        {Object.entries(record.inspectionResults).map(([section, items]) => {
          if (section === 'inventoryManagement') {
            const inventoryData = items as any;
            const hasInventoryData = Object.values(inventoryData).some((arr: any) => Array.isArray(arr) && arr.length > 0);
            
            if (!hasInventoryData) return null;
            
            return (
              <Card key={section} className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-2xl mb-8">
                <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                  <CardTitle className="text-xl md:text-2xl text-right font-bold text-gray-800">إدارة المخزون</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-8">
                    {inventoryData.shortages && inventoryData.shortages.length > 0 && (
                      <div>
                        <h4 className="text-xl font-bold mb-4 text-red-600 border-b-2 border-red-200 pb-2">النواقص</h4>
                        <div className="overflow-x-auto shadow-lg rounded-lg">
                          <table className="w-full border-collapse border-2 border-gray-300">
                            <thead>
                              <tr className="bg-red-50">
                                <th className="border border-gray-300 p-4 text-right font-bold text-lg">الصنف</th>
                                <th className="border border-gray-300 p-4 text-right font-bold text-lg">الوحدة</th>
                                <th className="border border-gray-300 p-4 text-right font-bold text-lg">الكمية المطلوبة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventoryData.shortages.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                  <td className="border border-gray-300 p-4 text-lg">{item.item}</td>
                                  <td className="border border-gray-300 p-4 text-lg">{item.unit}</td>
                                  <td className="border border-gray-300 p-4 text-lg">{item.requiredQuantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {inventoryData.stagnant && inventoryData.stagnant.length > 0 && (
                      <div>
                        <h4 className="text-xl font-bold mb-4 text-yellow-600 border-b-2 border-yellow-200 pb-2">الرواكد</h4>
                        <div className="overflow-x-auto shadow-lg rounded-lg">
                          <table className="w-full border-collapse border-2 border-gray-300">
                            <thead>
                              <tr className="bg-yellow-50">
                                <th className="border border-gray-300 p-4 text-right font-bold text-lg">الصنف</th>
                                <th className="border border-gray-300 p-4 text-right font-bold text-lg">الوحدة</th>
                                <th className="border border-gray-300 p-4 text-right font-bold text-lg">الكمية</th>
                                <th className="border border-gray-300 p-4 text-right font-bold text-lg">تاريخ الانتهاء</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventoryData.stagnant.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                  <td className="border border-gray-300 p-4 text-lg">{item.item}</td>
                                  <td className="border border-gray-300 p-4 text-lg">{item.unit}</td>
                                  <td className="border border-gray-300 p-4 text-lg">{item.quantity}</td>
                                  <td className="border border-gray-300 p-4 text-lg">{item.expiryDate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {inventoryData.expired && inventoryData.expired.length > 0 && (
                      <div>
                        <h4 className="text-xl font-bold mb-4 text-red-600 border-b-2 border-red-200 pb-2">منتهي الصلاحية</h4>
                        <div className="overflow-x-auto shadow-lg rounded-lg">
                          <table className="w-full border-collapse border-2 border-gray-300">
                            <thead>
                              <tr className="bg-red-50">
                                <th className="border border-gray-300 p-4 text-right font-bold text-lg">الصنف</th>
                                <th className="border border-gray-300 p-4 text-right font-bold text-lg">الوحدة</th>
                                <th className="border border-gray-300 p-4 text-right font-bold text-lg">الكمية</th>
                                <th className="border border-gray-300 p-4 text-right font-bold text-lg">تاريخ الانتهاء</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventoryData.expired.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                  <td className="border border-gray-300 p-4 text-lg">{item.item}</td>
                                  <td className="border border-gray-300 p-4 text-lg">{item.unit}</td>
                                  <td className="border border-gray-300 p-4 text-lg">{item.quantity}</td>
                                  <td className="border border-gray-300 p-4 text-lg">{item.expiryDate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {inventoryData.randomInventory && inventoryData.randomInventory.length > 0 && (
                      <div>
                        <h4 className="text-xl font-bold mb-4 text-blue-600 border-b-2 border-blue-200 pb-2">الجرد العشوائي</h4>
                        <div className="overflow-x-auto shadow-lg rounded-lg">
                          <table className="w-full border-collapse border-2 border-gray-300">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="border border-gray-300 p-3 text-right font-bold">الصنف</th>
                                <th className="border border-gray-300 p-3 text-right font-bold">الوحدة</th>
                                <th className="border border-gray-300 p-3 text-right font-bold">رصيد الدفتر</th>
                                <th className="border border-gray-300 p-3 text-right font-bold">المصروف</th>
                                <th className="border border-gray-300 p-3 text-right font-bold">الرصيد الفعلي</th>
                                <th className="border border-gray-300 p-3 text-right font-bold">العجز</th>
                                <th className="border border-gray-300 p-3 text-right font-bold">الزيادة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventoryData.randomInventory.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                  <td className="border border-gray-300 p-3">{item.item}</td>
                                  <td className="border border-gray-300 p-3">{item.unit}</td>
                                  <td className="border border-gray-300 p-3">{item.bookBalance}</td>
                                  <td className="border border-gray-300 p-3">{item.dispensed}</td>
                                  <td className="border border-gray-300 p-3">{item.actualBalance}</td>
                                  <td className="border border-gray-300 p-3">{item.shortage}</td>
                                  <td className="border border-gray-300 p-3">{item.surplus}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          }
          
          if (!Array.isArray(items) || items.length === 0) return null;
          
          const sectionTitle = {
            humanResources: 'القوة البشرية',
            documentsAndBooks: 'الدفاتر والمستندات',
            dispensingPolicies: 'سياسات الصرف والقوائم',
            storageAndHealth: 'الاشتراطات الصحية والتخزين',
            securityAndSafety: 'الأمن والسلامة',
            otherViolations: 'مخالفات أخرى'
          }[section];

          return (
            <Card key={section} className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-2xl mb-8">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <CardTitle className="text-xl md:text-2xl text-right font-bold text-gray-800">{sectionTitle}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all shadow-md hover:shadow-lg">
                      <h4 className="font-bold text-xl mb-6 text-blue-700 bg-blue-100 px-4 py-2 rounded-lg">المخالفة #{index + 1}</h4>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <p className="font-bold text-gray-600 mb-3 text-lg">المخالفة</p>
                          <p className="text-lg md:text-xl break-words leading-relaxed text-gray-800 bg-gray-50 p-4 rounded-lg">{item.violation}</p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-600 mb-3 text-lg">الإجراء المتخذ</p>
                          <p className="text-lg md:text-xl break-words leading-relaxed text-gray-800 bg-gray-50 p-4 rounded-lg">{item.actionTaken}</p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-600 mb-3 text-lg">المسؤول</p>
                          <p className="text-lg md:text-xl break-words text-gray-800 bg-gray-50 p-4 rounded-lg">{item.responsible}</p>
                        </div>
                      </div>
                      {item.attachments && item.attachments.length > 0 && (
                        <div className="mt-6">
                          <p className="font-bold text-gray-600 mb-3 text-lg">المرفقات</p>
                          <div className="flex flex-wrap gap-2">
                            {item.attachments.map((attachment: any, attIndex: number) => (
                              <div key={attIndex} className="text-sm bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-medium break-words">
                                {attachment.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* التوصيات */}
        {record.recommendations && (
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-2xl">
            <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-xl md:text-2xl text-right font-bold text-gray-800">التوصيات</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <p className="text-justify leading-loose text-lg md:text-xl break-words text-gray-800 bg-gray-50 p-6 rounded-lg">{record.recommendations}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
