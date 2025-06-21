
import { useState } from 'react';
import { InspectionRecord } from '@/types';

export const useRecordSelection = (filteredRecords: InspectionRecord[]) => {
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRecords.size === filteredRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(filteredRecords.map(record => record.id)));
    }
  };

  const getSelectedRecordsData = () => {
    return filteredRecords.filter(record => selectedRecords.has(record.id));
  };

  return {
    selectedRecords,
    setSelectedRecords,
    toggleRecordSelection,
    toggleSelectAll,
    getSelectedRecordsData
  };
};
