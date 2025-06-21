
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Save, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecordHeaderProps {
  onPreview: () => void;
  onSave: () => void;
}

export const RecordHeader: React.FC<RecordHeaderProps> = ({
  onPreview,
  onSave
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-lg border-b-2 border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="hover:bg-blue-100 transition-colors shadow-md text-sm sm:text-base">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للرئيسية
            </Button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">إنشاء محضر جديد</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={onPreview} variant="outline" size="sm" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all border-2 border-blue-300 hover:bg-blue-50 text-sm sm:text-base">
              <Eye className="ml-2 h-4 w-4" />
              معاينة
            </Button>
            <Button onClick={onSave} size="sm" className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all text-sm sm:text-base">
              <Save className="ml-2 h-4 w-4" />
              حفظ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
