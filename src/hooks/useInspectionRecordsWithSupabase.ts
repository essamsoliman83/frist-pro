import { useState, useEffect } from 'react';
import { InspectionRecord } from '@/types';
import { supabase, handleSupabaseError, handleSupabaseSuccess } from '@/integrations/supabase';

export const useInspectionRecordsWithSupabase = () => {
  const [records, setRecords] = useState<InspectionRecord[]>(() => {
    const saved = localStorage.getItem('pharmacy_inspection_records');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  // Load records from Supabase on mount
  useEffect(() => {
    loadRecords();
  }, []);

  // Save records to localStorage when they change
  useEffect(() => {
    localStorage.setItem('pharmacy_inspection_records', JSON.stringify(records));
  }, [records]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inspection_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading records:', error);
        // Fall back to localStorage records
        return;
      }

      if (data && data.length > 0) {
        // Transform Supabase data to match our local format
        const transformedRecords = data.map(record => ({
          id: record.id,
          serialNumber: record.serial_number,
          basicData: record.basic_data,
          inspectionResults: record.inspection_results,
          recommendations: record.recommendations || '',
          createdAt: record.created_at,
          createdBy: record.created_by,
          updatedAt: record.updated_at
        }));
        setRecords(transformedRecords);
      }
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (record: Omit<InspectionRecord, 'id' | 'serialNumber' | 'createdAt'>) => {
    try {
      setLoading(true);
      
      const newRecord: InspectionRecord = {
        ...record,
        id: Date.now().toString(),
        serialNumber: `INS-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      // Try to add to Supabase
      const { error } = await supabase
        .from('inspection_records')
        .insert([{
          id: newRecord.id,
          serial_number: newRecord.serialNumber,
          basic_data: newRecord.basicData,
          inspection_results: newRecord.inspectionResults,
          recommendations: newRecord.recommendations,
          created_by: newRecord.createdBy,
          created_at: newRecord.createdAt,
          updated_at: newRecord.createdAt
        }]);

      if (error) {
        console.error('Error adding record to Supabase:', error);
      }

      // Add to local state regardless
      setRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (error) {
      console.error('Error adding record:', error);
      // Add to local state as fallback
      const newRecord: InspectionRecord = {
        ...record,
        id: Date.now().toString(),
        serialNumber: `INS-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (id: string, updates: Partial<InspectionRecord>) => {
    try {
      setLoading(true);
      
      const updatedAt = new Date().toISOString();
      
      // Try to update in Supabase
      const { error } = await supabase
        .from('inspection_records')
        .update({
          ...(updates.basicData && { basic_data: updates.basicData }),
          ...(updates.inspectionResults && { inspection_results: updates.inspectionResults }),
          ...(updates.recommendations && { recommendations: updates.recommendations }),
          updated_at: updatedAt
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating record in Supabase:', error);
      }

      // Update local state regardless
      setRecords(prev => prev.map(record => 
        record.id === id ? { ...record, ...updates, updatedAt } : record
      ));
    } catch (error) {
      console.error('Error updating record:', error);
      // Update local state as fallback
      setRecords(prev => prev.map(record => 
        record.id === id ? { ...record, ...updates } : record
      ));
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      setLoading(true);
      console.log(`Permanently deleting record with ID: ${id}`);
      
      // Try to delete from Supabase
      const { error } = await supabase
        .from('inspection_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting record from Supabase:', error);
      }

      // Delete from local state regardless
      setRecords(prev => {
        const filteredRecords = prev.filter(record => record.id !== id);
        console.log(`Records after deletion: ${filteredRecords.length} remaining`);
        return filteredRecords;
      });
      
      // Delete related attachments
      const attachmentsKey = `attachments_${id}`;
      const attachments = localStorage.getItem(attachmentsKey);
      if (attachments) {
        localStorage.removeItem(attachmentsKey);
        console.log(`Deleted attachments for record ${id}`);
      }
      
      // Delete any related data
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
    } catch (error) {
      console.error('Error deleting record:', error);
      // Delete from local state as fallback
      setRecords(prev => prev.filter(record => record.id !== id));
    } finally {
      setLoading(false);
    }
  };

  // Helper functions (same as original)
  const toArray = (value: string | string[]): string[] => {
    return Array.isArray(value) ? value : [value];
  };

  const toString = (value: string | string[]): string => {
    return Array.isArray(value) ? value.join(', ') : value;
  };

  const parseInspectorNames = (inspectorName: string | string[]): string[] => {
    if (Array.isArray(inspectorName)) {
      return inspectorName.filter(name => name.trim().length > 0);
    }
    
    if (!inspectorName.trim()) return [];
    
    const names = inspectorName.split(/[-/]/).map(name => name.trim()).filter(name => name.length > 0);
    return names;
  };

  const matchesInspectorNames = (recordInspectorName: string | string[], searchInspectorName: string): boolean => {
    if (!searchInspectorName.trim()) return true;
    
    const recordNames = parseInspectorNames(recordInspectorName);
    const searchNames = parseInspectorNames(searchInspectorName);
    
    return searchNames.some(searchName => 
      recordNames.some(recordName => 
        recordName.toLowerCase().includes(searchName.toLowerCase())
      )
    );
  };

  return {
    records,
    loading,
    addRecord,
    updateRecord,
    deleteRecord,
    loadRecords,
    toArray,
    toString,
    parseInspectorNames,
    matchesInspectorNames
  };
};
