
import React from 'react';
import { Button } from '@/components/ui/button';
import { ViolationListViewer } from '@/components/ViolationListViewer';
import { ViolationCategory } from '@/types/violations';
import { FileText } from 'lucide-react';

interface ViolationListButtonProps {
  category: ViolationCategory;
  onViolationSelect?: (violations: string[]) => void;
}

export const ViolationListButton: React.FC<ViolationListButtonProps> = ({ 
  category, 
  onViolationSelect 
}) => {
  const handleViolationSelect = (violations: string[]) => {
    console.log('ViolationListButton - Selected violations:', violations);
    console.log('ViolationListButton - onViolationSelect function:', onViolationSelect);
    console.log('ViolationListButton - Category:', category);
    
    if (onViolationSelect) {
      console.log('ViolationListButton - Calling onViolationSelect');
      onViolationSelect(violations);
    } else {
      console.log('ViolationListButton - onViolationSelect is undefined');
    }
  };

  return (
    <ViolationListViewer category={category} onViolationSelect={handleViolationSelect}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full sm:w-auto bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 text-blue-700 hover:from-blue-200 hover:to-indigo-200 hover:border-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl font-bold text-lg"
      >
        <FileText className="ml-2 h-5 w-5" />
        بيان المخالفات
      </Button>
    </ViolationListViewer>
  );
};
