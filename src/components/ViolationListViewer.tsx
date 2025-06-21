
import React, { useState } from 'react';
import { ViolationCategory, VIOLATION_CATEGORIES } from '@/types/violations';
import { useViolationLists } from '@/hooks/useViolationLists';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Check, Plus, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

interface ViolationListViewerProps {
  category: ViolationCategory;
  children: React.ReactNode;
  onViolationSelect?: (violations: string[]) => void;
}

export const ViolationListViewer: React.FC<ViolationListViewerProps> = ({
  category,
  children,
  onViolationSelect
}) => {
  const { getViolationsByCategory } = useViolationLists();
  const violations = getViolationsByCategory(category);
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  console.log('ViolationListViewer - Category:', category);
  console.log('ViolationListViewer - Violations:', violations);
  console.log('ViolationListViewer - onViolationSelect:', onViolationSelect);

  const handleViolationToggle = (violationTitle: string) => {
    console.log('Toggling violation:', violationTitle);
    setSelectedViolations(prev => {
      const newSelection = prev.includes(violationTitle)
        ? prev.filter(v => v !== violationTitle)
        : [...prev, violationTitle];
      console.log('New selection:', newSelection);
      return newSelection;
    });
  };

  const handleInsertViolations = () => {
    console.log('Insert violations called with:', selectedViolations);
    console.log('onViolationSelect function:', onViolationSelect);
    
    if (selectedViolations.length > 0) {
      if (onViolationSelect) {
        console.log('Calling onViolationSelect with:', selectedViolations);
        onViolationSelect(selectedViolations);
        toast({
          title: "تم إدراج المخالفات",
          description: `تم إدراج ${selectedViolations.length} مخالفة بنجاح`,
        });
      } else {
        console.log('onViolationSelect is not defined');
      }
      setSelectedViolations([]);
      setIsOpen(false);
    } else {
      console.log('No violations selected');
    }
  };

  const handleClearSelection = () => {
    console.log('Clearing selection');
    setSelectedViolations([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center border-b pb-4">
          <DialogTitle className="text-right text-xl font-bold text-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-lg">
            اختيار المخالفات - {VIOLATION_CATEGORIES[category]}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">اختر المخالفات التي تريد إضافتها إلى القسم</p>
        </DialogHeader>
        
        <div className="space-y-6 p-2">
          {violations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-20 w-20 mx-auto text-gray-300 mb-6" />
              <p className="text-gray-500 text-xl font-semibold mb-2">لا توجد مخالفات متاحة</p>
              <p className="text-gray-400 text-lg">لم يتم إضافة أي مخالفات لهذا القسم بعد</p>
              <p className="text-gray-400 text-sm mt-2">يمكن للمدير إضافة المخالفات من قسم "إدارة بيان المخالفات"</p>
            </div>
          ) : (
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200">
                <CardTitle className="text-right text-lg font-bold text-blue-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>المخالفات المتاحة ({violations.length})</span>
                  </div>
                  {selectedViolations.length > 0 && (
                    <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full">
                      تم اختيار {selectedViolations.length}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6 max-h-96 overflow-y-auto">
                {violations.map((violation) => (
                  <div 
                    key={violation.id} 
                    className={`flex items-center space-x-3 space-x-reverse p-4 border-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer ${
                      selectedViolations.includes(violation.title) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleViolationToggle(violation.title)}
                  >
                    <Checkbox
                      checked={selectedViolations.includes(violation.title)}
                      onCheckedChange={() => handleViolationToggle(violation.title)}
                      className="text-blue-600"
                    />
                    <div className="flex-1 text-right">
                      <p className="font-medium text-gray-800 text-lg">{violation.title}</p>
                      {violation.description && violation.description !== violation.title && (
                        <p className="text-sm text-gray-500 mt-1">{violation.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          {violations.length > 0 && (
            <div className="flex justify-between items-center border-t pt-6 bg-gray-50 px-6 py-4 rounded-lg">
              <div className="flex gap-3">
                <Button
                  onClick={handleClearSelection}
                  variant="outline"
                  disabled={selectedViolations.length === 0}
                  className="border-2 border-gray-300 hover:border-gray-400"
                >
                  <X className="ml-2 h-4 w-4" />
                  إلغاء التحديد
                </Button>
              </div>
              <Button
                onClick={handleInsertViolations}
                disabled={selectedViolations.length === 0}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Plus className="ml-2 h-4 w-4" />
                إدراج المخالفات المحددة ({selectedViolations.length})
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
