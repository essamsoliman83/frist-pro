
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, X, FileText, Table, Sparkles, FileDown } from 'lucide-react';
import { InspectionRecord } from '@/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecords: InspectionRecord[];
  onExport: (format: 'pdf' | 'excel', options: any) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  selectedRecords,
  onExport
}) => {
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [fileName, setFileName] = useState('تقرير_محاضر_التفتيش');

  const handleExport = () => {
    const options = {
      fileName,
      recordsCount: selectedRecords.length
    };
    
    onExport(format, options);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] bg-gradient-to-br from-white via-slate-50 to-blue-50 border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4 sm:pb-6">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
            <FileDown className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            📤 تصدير المحاضر المحددة
          </DialogTitle>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            إنشاء تقرير شامل لـ <span className="font-bold text-emerald-600">{selectedRecords.length}</span> محضر تفتيش
          </p>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 px-1 sm:px-2">
          {/* File Name Section */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-right block font-semibold text-slate-700 flex items-center text-sm sm:text-base">
              <Sparkles className="ml-2 h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
              اسم الملف
            </Label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="text-right border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm sm:text-base h-10 sm:h-auto"
              placeholder="أدخل اسم الملف المطلوب"
            />
          </div>

          {/* Format Selection */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-right block font-semibold text-slate-700 flex items-center text-sm sm:text-base">
              <FileText className="ml-2 h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
              تنسيق التصدير
            </Label>
            <RadioGroup 
              value={format} 
              onValueChange={(value) => setFormat(value as 'pdf' | 'excel')}
              className="space-y-2 sm:space-y-3"
            >
              <div className="flex items-center justify-between p-3 sm:p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-300 transition-all duration-200 cursor-pointer bg-white/60 backdrop-blur-sm hover:bg-white/80">
                <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
                  <RadioGroupItem value="pdf" id="pdf" className="border-2 border-slate-300" />
                  <Label htmlFor="pdf" className="flex items-center cursor-pointer font-medium">
                    <div className="bg-red-100 p-1.5 sm:p-2 rounded-lg ml-2 sm:ml-3">
                      <FileText className="h-3 w-3 sm:h-5 sm:w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm sm:text-base">PDF تقرير</div>
                      <div className="text-xs sm:text-sm text-slate-500">تقرير منسق للطباعة والعرض</div>
                    </div>
                  </Label>
                </div>
                {format === 'pdf' && (
                  <div className="bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    ✓ محدد
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 sm:p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-300 transition-all duration-200 cursor-pointer bg-white/60 backdrop-blur-sm hover:bg-white/80">
                <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
                  <RadioGroupItem value="excel" id="excel" className="border-2 border-slate-300" />
                  <Label htmlFor="excel" className="flex items-center cursor-pointer font-medium">
                    <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg ml-2 sm:ml-3">
                      <Table className="h-3 w-3 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm sm:text-base">Excel (CSV)</div>
                      <div className="text-xs sm:text-sm text-slate-500">بيانات جدولية للتحليل والمعالجة</div>
                    </div>
                  </Label>
                </div>
                {format === 'excel' && (
                  <div className="bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    ✓ محدد
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>

          {/* Export Summary */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3 sm:p-4">
            <h4 className="font-semibold text-emerald-800 mb-2 text-right text-sm sm:text-base">📊 ملخص التصدير</h4>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-emerald-700">
              <div className="flex justify-between">
                <span>عدد المحاضر:</span>
                <span className="font-semibold">{selectedRecords.length} محضر</span>
              </div>
              <div className="flex justify-between">
                <span>التنسيق:</span>
                <span className="font-semibold">{format === 'pdf' ? 'PDF تقرير' : 'Excel (CSV)'}</span>
              </div>
              <div className="flex justify-between">
                <span>يشمل:</span>
                <span className="font-semibold">اسم المفتش + جميع البيانات</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 sm:space-x-reverse pt-4 border-t border-slate-200">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 border-2 border-slate-300 hover:border-slate-400 transition-all duration-200 text-sm"
            >
              <X className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              إلغاء
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={!fileName.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white px-6 sm:px-8 py-2.5 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
            >
              <Download className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              🚀 بدء التصدير
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
