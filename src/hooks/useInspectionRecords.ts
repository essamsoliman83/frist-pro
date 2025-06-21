import { useState, useEffect } from 'react';
import { InspectionRecord } from '@/types';

export const useInspectionRecords = () => {
  const [records, setRecords] = useState<InspectionRecord[]>(() => {
    const saved = localStorage.getItem('pharmacy_inspection_records');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pharmacy_inspection_records', JSON.stringify(records));
  }, [records]);

  const addRecord = (record: Omit<InspectionRecord, 'id' | 'serialNumber' | 'createdAt'>) => {
    const newRecord: InspectionRecord = {
      ...record,
      id: Date.now().toString(),
      serialNumber: `INS-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setRecords(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const updateRecord = (id: string, updates: Partial<InspectionRecord>) => {
    setRecords(prev => prev.map(record => 
      record.id === id ? { ...record, ...updates } : record
    ));
  };

  const deleteRecord = (id: string) => {
    console.log(`Permanently deleting record with ID: ${id}`);
    
    // حذف المحضر من قائمة المحاضر
    setRecords(prev => {
      const filteredRecords = prev.filter(record => record.id !== id);
      console.log(`Records after deletion: ${filteredRecords.length} remaining`);
      return filteredRecords;
    });
    
    // حذف المرفقات المرتبطة بالمحضر
    const attachmentsKey = `attachments_${id}`;
    const attachments = localStorage.getItem(attachmentsKey);
    if (attachments) {
      localStorage.removeItem(attachmentsKey);
      console.log(`Deleted attachments for record ${id}`);
    }
    
    // حذف أي بيانات إضافية مرتبطة بالمحضر
    const relatedKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(id)) {
        relatedKeys.push(key);
      }
    }
    
    relatedKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Deleted related data: ${key}`);
    });
    
    console.log(`Complete deletion of record ${id} and all related data finished`);
  };

  // Helper function to convert to array if needed
  const toArray = (value: string | string[]): string[] => {
    return Array.isArray(value) ? value : [value];
  };

  // Helper function to convert to string for display
  const toString = (value: string | string[]): string => {
    return Array.isArray(value) ? value.join(', ') : value;
  };

  // دالة لتحليل أسماء المفتشين المتعددة
  const parseInspectorNames = (inspectorName: string | string[]): string[] => {
    if (Array.isArray(inspectorName)) {
      return inspectorName.filter(name => name.trim().length > 0);
    }
    
    if (!inspectorName.trim()) return [];
    
    // تقسيم الأسماء باستخدام - أو /
    const names = inspectorName.split(/[-\/]/).map(name => name.trim()).filter(name => name.length > 0);
    return names;
  };

  // دالة للتحقق من تطابق أسماء المفتشين
  const matchesInspectorNames = (recordInspectorName: string | string[], searchInspectorName: string): boolean => {
    if (!searchInspectorName.trim()) return true;
    
    const recordNames = parseInspectorNames(recordInspectorName);
    const searchNames = parseInspectorNames(searchInspectorName);
    
    // التحقق من وجود أي من أسماء البحث في أسماء المحضر
    return searchNames.some(searchName => 
      recordNames.some(recordName => 
        recordName.toLowerCase().includes(searchName.toLowerCase())
      )
    );
  };

  // دالة للتحقق من تطابق أسماء المفتشين مع القائمة المتعددة - محسنة للبحث الدقيق
  const matchesSelectedInspectors = (recordInspectorName: string | string[], selectedInspectors: string[]): boolean => {
    if (!selectedInspectors.length) return true;
    
    // التحقق من وجود خيار "الكل"
    if (selectedInspectors.includes('الكل')) return true;
    
    const recordNames = parseInspectorNames(recordInspectorName);
    
    // التحقق من وجود أي من المفتشين المحددين في أسماء المحضر - بحث دقيق
    return selectedInspectors.some(selectedInspector => 
      recordNames.some(recordName => 
        recordName.toLowerCase().includes(selectedInspector.toLowerCase()) ||
        selectedInspector.toLowerCase().includes(recordName.toLowerCase())
      )
    );
  };

  // دالة للتحقق من تطابق جهات العمل
  const matchesWorkPlace = (recordWorkPlace: string | string[], searchWorkPlace: string): boolean => {
    if (!searchWorkPlace.trim()) return true;
    
    const workPlaces = toArray(recordWorkPlace);
    return workPlaces.some(workPlace => 
      workPlace.toLowerCase().includes(searchWorkPlace.toLowerCase())
    );
  };

  // دالة للتحقق من تطابق جهات العمل مع القائمة المتعددة
  const matchesSelectedWorkPlaces = (recordWorkPlace: string | string[], selectedWorkPlaces: string[]): boolean => {
    if (!selectedWorkPlaces.length) return true;
    
    const recordWorkPlaces = toArray(recordWorkPlace);
    
    // التحقق من وجود أي من جهات العمل المحددة في جهات عمل المحضر
    return selectedWorkPlaces.some(selectedWorkPlace => 
      recordWorkPlaces.some(recordWP => 
        recordWP.toLowerCase().includes(selectedWorkPlace.toLowerCase())
      )
    );
  };

  // دالة البحث في المخالفات
  const matchesViolationText = (record: InspectionRecord, searchText: string): boolean => {
    if (!searchText.trim()) return true;
    
    const lowerSearchText = searchText.toLowerCase();
    
    // البحث في جميع أقسام المخالفات
    if (record.inspectionResults) {
      for (const section in record.inspectionResults) {
        const violations = record.inspectionResults[section];
        if (Array.isArray(violations)) {
          const found = violations.some(violation => 
            violation.toLowerCase().includes(lowerSearchText)
          );
          if (found) return true;
        }
      }
    }
    
    return false;
  };

  // دالة البحث في إدارة المخزون
  const matchesInventoryType = (record: InspectionRecord, inventoryType: string): boolean => {
    if (!inventoryType.trim()) return true;
    
    const lowerInventoryType = inventoryType.toLowerCase();
    
    // البحث في قسم إدارة المخزون
    if (record.inspectionResults && record.inspectionResults.inventoryManagement) {
      const violations = record.inspectionResults.inventoryManagement;
      if (Array.isArray(violations)) {
        return violations.some(violation => 
          violation.toLowerCase().includes(lowerInventoryType)
        );
      }
    }
    
    return false;
  };

  // دالة تحقق من وجود اسم المفتش في المحضر - للاستخدام في قسم "محاضري"
  const isMyRecord = (record: InspectionRecord, userName: string): boolean => {
    if (!userName.trim()) return false;
    
    const inspectorNames = toString(record.basicData.inspectorName);
    return inspectorNames.toLowerCase().includes(userName.toLowerCase());
  };

  const searchRecords = (filters: any) => {
    return records.filter(record => {
      if (filters.dateFrom && new Date(record.basicData.date) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(record.basicData.date) > new Date(filters.dateTo)) {
        return false;
      }
      
      // التحقق من أسماء المفتشين - استخدام القائمة المتعددة إذا كانت متوفرة
      if (filters.selectedInspectors && filters.selectedInspectors.length > 0) {
        if (!matchesSelectedInspectors(record.basicData.inspectorName, filters.selectedInspectors)) {
          return false;
        }
      } else if (filters.inspectorName && !matchesInspectorNames(record.basicData.inspectorName, filters.inspectorName)) {
        return false;
      }
      
      // التحقق من جهات العمل - استخدام القائمة المتعددة إذا كانت متوفرة
      if (filters.selectedWorkPlaces && filters.selectedWorkPlaces.length > 0) {
        if (!matchesSelectedWorkPlaces(record.basicData.workPlace, filters.selectedWorkPlaces)) {
          return false;
        }
      } else if (filters.workPlace && !matchesWorkPlace(record.basicData.workPlace, filters.workPlace)) {
        return false;
      }
      
      // التحقق من البحث في المخالفات
      if (filters.violationText && !matchesViolationText(record, filters.violationText)) {
        return false;
      }
      
      // التحقق من نوع إدارة المخزون
      if (filters.inventoryType && !matchesInventoryType(record, filters.inventoryType)) {
        return false;
      }
      
      return true;
    });
  };

  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    searchRecords,
    // Helper functions for components that need to handle both formats
    toArray,
    toString,
    matchesSelectedInspectors,
    matchesSelectedWorkPlaces,
    matchesViolationText,
    matchesInventoryType,
    // New function for "My Records" filtering
    isMyRecord
  };
};
