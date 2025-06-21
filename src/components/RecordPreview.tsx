import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Save, FileText, Printer, Paperclip, Download } from 'lucide-react';
import { printRecord } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { 
  getRecordAttachments, 
  downloadAttachment, 
  downloadAllAttachments,
  createAttachmentIndicator 
} from '@/utils/attachmentUtils';

interface RecordPreviewProps {
  formData: any;
  serialNumber: string;
  onBack: () => void;
  onSave: () => void;
  isViewMode?: boolean;
  showPrintButton?: boolean;
}

export const RecordPreview: React.FC<RecordPreviewProps> = ({
  formData,
  serialNumber,
  onBack,
  onSave,
  isViewMode = false,
  showPrintButton = true
}) => {
  // استخدام النظام الجديد للحصول على المرفقات
  const attachments = formData.id ? getRecordAttachments(formData.id) : [];
  const attachmentInfo = createAttachmentIndicator(formData.id);

  const handleDownloadAttachment = (attachment: any) => {
    downloadAttachment(attachment);
  };

  const handleDownloadAllAttachments = () => {
    if (!formData.id) {
      toast.error('معرف المحضر غير صحيح');
      return;
    }
    
    downloadAllAttachments(formData.id);
  };

  // تحويل الوقت إلى نظام 24 ساعة إذا لم يكن كذلك
  const formatTime24 = (time: string) => {
    if (!time) return '';
    // إذا كان الوقت بالفعل بصيغة 24 ساعة، عرضه كما هو
    if (time.includes(':') && time.length === 5) {
      return time;
    }
    // إذا كان بصيغة أخرى، حاول تحويله
    try {
      const date = new Date(`2000-01-01 ${time}`);
      return date.toTimeString().slice(0, 5);
    } catch {
      return time;
    }
  };

  // دالة لإضافة صباحاً أو مساءً للوقت
  const formatTimeWithPeriod = (time: string) => {
    if (!time) return '';
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    const period = hour < 12 ? 'صباحاً' : 'مساءً';
    return `${formatTime24(time)} ${period}`;
  };

  // دالة لعرض القيم كنص (سواء كانت مصفوفة أو نص)
  const displayValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || '';
  };

  // دالة للطباعة والتصدير المحسنة
  const handlePrint = () => {
    console.log('Print button clicked from RecordPreview');
    
    try {
      printRecord(formData);
    } catch (error) {
      console.error('Print error in RecordPreview:', error);
      alert('حدث خطأ أثناء الطباعة. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 md:p-8 font-['Amiri',_'Times_New_Roman',_serif]">
      <div className="max-w-4xl mx-auto">
        {/* أزرار التحكم - تخفى عند الطباعة */}
        {!isViewMode && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 no-print">
            <Button onClick={onBack} variant="outline" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للتحرير
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* مؤشر المرفقات المحسن */}
              {attachmentInfo && (
                <Button 
                  onClick={handleDownloadAllAttachments}
                  variant="outline"
                  className="w-full sm:w-auto bg-green-50 hover:bg-green-100 text-green-700 border-green-200 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                >
                  <Download className="ml-2 h-4 w-4" />
                  <Paperclip className="ml-1 h-3 w-3" />
                  {attachmentInfo.label}
                </Button>
              )}
              
              {showPrintButton && (
                <Button onClick={handlePrint} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base">
                  <Printer className="ml-2 h-4 w-4" />
                  طباعة
                </Button>
              )}
              <Button onClick={onSave} className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base">
                <Save className="ml-2 h-4 w-4" />
                حفظ
              </Button>
            </div>
          </div>
        )}

        {/* عرض زر الطباعة في وضع العرض أيضاً */}
        {isViewMode && showPrintButton && (
          <div className="flex justify-between items-center mb-6 no-print">
            <div className="flex items-center gap-2">
              {/* مؤشر المرفقات في وضع العرض */}
              {attachmentInfo && (
                <Button 
                  onClick={handleDownloadAllAttachments}
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 shadow-lg hover:shadow-xl transition-all"
                >
                  <Download className="ml-2 h-4 w-4" />
                  <Paperclip className="ml-1 h-3 w-3" />
                  {attachmentInfo.label}
                </Button>
              )}
            </div>
            
            <Button onClick={handlePrint} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
              <Printer className="ml-2 h-4 w-4" />
              طباعة المحضر
            </Button>
          </div>
        )}

        {/* محتوى المحضر */}
        <div className="bg-white border-2 border-gray-200 p-3 sm:p-4 md:p-8 print:border-0 print:p-0 rounded-lg shadow-xl print:shadow-none">
          {/* رأس المحضر */}
          <div className="text-center mb-6 sm:mb-8 border-b-2 border-gray-300 pb-4 sm:pb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-800">محضر تفتيش صيدلي</h1>
            <div className="flex items-center justify-center gap-4">
              <p className="text-base sm:text-lg md:text-xl text-gray-600 font-semibold">رقم المحضر: {serialNumber}</p>
              {/* مؤشر المرفقات في رأس المحضر */}
              {attachmentInfo && (
                <div className="flex items-center text-green-600 text-sm">
                  <Paperclip className="h-4 w-4 ml-1" />
                  <span>{attachmentInfo.label}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* النص التمهيدي */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <p className="text-justify leading-loose text-base md:text-lg text-gray-800">
                إنه في يوم <strong className="text-blue-700">{formData.basicData?.day || 'غير محدد'}</strong> الموافق <strong className="text-blue-700">{formData.basicData?.date || 'غير محدد'}</strong> في تمام الساعة <strong className="text-blue-700">{formatTimeWithPeriod(formData.basicData?.time || '')}</strong> قمنا نحن <strong className="text-blue-700">{displayValue(formData.basicData?.inspectorName || 'غير محدد')}</strong> من مفتشي <strong className="text-blue-700">{displayValue(formData.basicData?.workPlace || 'غير محدد')}</strong> بالمرور على <strong className="text-blue-700">{formData.basicData?.institutionName || 'غير محدد'}</strong> <strong className="text-blue-700">{formData.basicData?.inspectionLocation || ''}</strong>{formData.basicData?.presentPharmacist && <> وتقابلنا مع <strong className="text-blue-700">{formData.basicData.presentPharmacist}</strong></>} وكان المرور بناءً على <strong className="text-blue-700">{formData.basicData?.inspectionReason || 'غير محدد'}</strong>.
              </p>
            </div>

            {/* عرض تفاصيل التفتيش */}
            {formData.inspectionResults && Object.entries(formData.inspectionResults).map(([section, items]) => {
              if (section === 'inventoryManagement') {
                const inventoryData = items as any;
                const hasInventoryData = inventoryData && Object.values(inventoryData).some((arr: any) => Array.isArray(arr) && arr.length > 0);
                
                if (!hasInventoryData) return null;
                
                return (
                  <div key={section} className="mb-8 print-page-break">
                    <h3 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-200 pb-2">إدارة المخزون</h3>
                    
                    {inventoryData.shortages && inventoryData.shortages.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-red-600">النواقص</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-red-50">
                                <th className="border border-gray-300 p-3 text-right font-semibold">الصنف</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold">الوحدة</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold">الكمية المطلوبة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventoryData.shortages.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 p-3">{item.item}</td>
                                  <td className="border border-gray-300 p-3">{item.unit}</td>
                                  <td className="border border-gray-300 p-3">{item.requiredQuantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {inventoryData.stagnant && inventoryData.stagnant.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-yellow-600">الرواكد</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-yellow-50">
                                <th className="border border-gray-300 p-3 text-right font-semibold">الصنف</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold">الوحدة</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold">الكمية</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold">تاريخ الانتهاء</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventoryData.stagnant.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 p-3">{item.item}</td>
                                  <td className="border border-gray-300 p-3">{item.unit}</td>
                                  <td className="border border-gray-300 p-3">{item.quantity}</td>
                                  <td className="border border-gray-300 p-3">{item.expiryDate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {inventoryData.expired && inventoryData.expired.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-red-600">منتهي الصلاحية</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-red-50">
                                <th className="border border-gray-300 p-3 text-right font-semibold">الصنف</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold">الوحدة</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold">الكمية</th>
                                <th className="border border-gray-300 p-3 text-right font-semibold">تاريخ الانتهاء</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventoryData.expired.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 p-3">{item.item}</td>
                                  <td className="border border-gray-300 p-3">{item.unit}</td>
                                  <td className="border border-gray-300 p-3">{item.quantity}</td>
                                  <td className="border border-gray-300 p-3">{item.expiryDate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {inventoryData.randomInventory && inventoryData.randomInventory.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-blue-600">الجرد العشوائي</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="border border-gray-300 p-2 text-right font-semibold">الصنف</th>
                                <th className="border border-gray-300 p-2 text-right font-semibold">الوحدة</th>
                                <th className="border border-gray-300 p-2 text-right font-semibold">رصيد الدفتر</th>
                                <th className="border border-gray-300 p-2 text-right font-semibold">المصروف</th>
                                <th className="border border-gray-300 p-2 text-right font-semibold">الرصيد الفعلي</th>
                                <th className="border border-gray-300 p-2 text-right font-semibold">العجز</th>
                                <th className="border border-gray-300 p-2 text-right font-semibold">الزيادة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inventoryData.randomInventory.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 p-2">{item.item}</td>
                                  <td className="border border-gray-300 p-2">{item.unit}</td>
                                  <td className="border border-gray-300 p-2">{item.bookBalance}</td>
                                  <td className="border border-gray-300 p-2">{item.dispensed}</td>
                                  <td className="border border-gray-300 p-2">{item.actualBalance}</td>
                                  <td className="border border-gray-300 p-2">{item.shortage}</td>
                                  <td className="border border-gray-300 p-2">{item.surplus}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              
              if (!Array.isArray(items) || items.length === 0) return null;
              
              return (
                <div key={section} className="mb-8">
                  <h3 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-200 pb-2">
                    {section === 'humanResources' && 'القوة البشرية'}
                    {section === 'documentsAndBooks' && 'الدفاتر والمستندات'}
                    {section === 'dispensingPolicies' && 'سياسات الصرف والقوائم'}
                    {section === 'storageAndHealth' && 'الاشتراطات الصحية والتخزين'}
                    {section === 'securityAndSafety' && 'الأمن والسلامة'}
                    {section === 'otherViolations' && 'مخالفات أخرى'}
                  </h3>
                  {items.map((item: any, index: number) => (
                    <div key={index} className="mb-6 p-6 border-2 border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                      <h4 className="text-lg font-semibold mb-4 text-blue-700">المخالفة #{index + 1}</h4>
                      <div className="space-y-3">
                        <p className="text-base md:text-lg"><strong className="text-gray-700">المخالفة:</strong> <span className="text-gray-800">{item.violation}</span></p>
                        <p className="text-base md:text-lg"><strong className="text-gray-700">الإجراء المتخذ:</strong> <span className="text-gray-800">{item.actionTaken}</span></p>
                        <p className="text-base md:text-lg"><strong className="text-gray-700">المسؤول:</strong> <span className="text-gray-800">{item.responsible}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* التوصيات */}
            {formData.recommendations && formData.recommendations.trim() && (
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 print-page-break">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-blue-800">التوصيات:</h3>
                <p className="text-justify text-base md:text-lg leading-relaxed text-gray-800">{formData.recommendations}</p>
              </div>
            )}
          </div>

          {/* التوقيعات */}
          <div className="mt-20 print-page-break">
            <div className="flex justify-around items-center text-center gap-4 sm:gap-8">
              <div className="flex-1">
                <div className="border-t-2 border-black pt-4 mt-8">
                  <p className="font-semibold text-sm sm:text-base md:text-lg">توقيع المفتش</p>
                </div>
              </div>
              <div className="flex-1">
                <div className="border-t-2 border-black pt-4 mt-8">
                  <p className="font-semibold text-sm sm:text-base md:text-lg">توقيع مدير التفتيش الصيدلي الحكومي</p>
                </div>
              </div>
              <div className="flex-1">
                <div className="border-t-2 border-black pt-4 mt-8">
                  <p className="font-semibold text-sm sm:text-base md:text-lg">توقيع مدير إدارة الصيدلة</p>
                </div>
              </div>
            </div>
            
            {/* معلومات إضافية للطباعة */}
            <div className="mt-12 text-center text-sm text-gray-600">
              <p>تم إنشاء هذا المحضر بتاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
              <p>نظام إدارة محاضر التفتيش الصيدلي - إدارة الصيدلة بكفرالشيخ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
