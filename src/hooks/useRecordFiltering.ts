
import { useMemo } from 'react';
import { InspectionRecord } from '@/types';
import { useInspectionRecords } from '@/hooks/useInspectionRecords';

export const useRecordFiltering = (
  records: InspectionRecord[],
  filters: any,
  currentUser: any,
  isMyRecordsView: boolean
) => {
  const { toString, matchesViolationText } = useInspectionRecords();

  const filteredRecords = useMemo(() => {
    if (!currentUser) return [];

    console.log('Starting search with filters:', filters);
    console.log('Current user:', currentUser);
    console.log('Is my records view:', isMyRecordsView);
    
    let filtered = records;

    if (isMyRecordsView || currentUser.role === 'inspector') {
      filtered = filtered.filter(record => {
        const inspectorNames = toString(record.basicData.inspectorName);
        return inspectorNames.toLowerCase().includes(currentUser.name.toLowerCase());
      });
    } else {
      if (currentUser.role === 'supervisor') {
        let userWorkPlaces: string[] = [];
        
        if (filters.selectedWorkPlaces && filters.selectedWorkPlaces.length > 0) {
          userWorkPlaces = [...filters.selectedWorkPlaces];
        } else {
          if (currentUser.administrativeWorkPlaces && currentUser.administrativeWorkPlaces.length > 0) {
            userWorkPlaces = [...currentUser.administrativeWorkPlaces];
          } else if (currentUser.workPlace) {
            userWorkPlaces = [currentUser.workPlace];
          }
        }
        
        if (userWorkPlaces.length > 0) {
          filtered = filtered.filter(record => {
            const recordWorkPlaces = Array.isArray(record.basicData.workPlace) 
              ? record.basicData.workPlace 
              : [record.basicData.workPlace];
            
            return recordWorkPlaces.some(recordWorkPlace => 
              userWorkPlaces.some(userWorkPlace => 
                userWorkPlace && recordWorkPlace && (
                  userWorkPlace.toLowerCase().includes(recordWorkPlace.toLowerCase()) ||
                  recordWorkPlace.toLowerCase().includes(userWorkPlace.toLowerCase())
                )
              )
            );
          });
        }
      } else if (currentUser.role === 'manager') {
        let userWorkPlaces: string[] = [];
        
        if (filters.selectedWorkPlaces && filters.selectedWorkPlaces.length > 0) {
          userWorkPlaces = [...filters.selectedWorkPlaces];
        } else if (currentUser.administrativeWorkPlaces && currentUser.administrativeWorkPlaces.length > 0) {
          userWorkPlaces = [...currentUser.administrativeWorkPlaces];
        }
        
        if (userWorkPlaces.length > 0) {
          filtered = filtered.filter(record => {
            const recordWorkPlaces = Array.isArray(record.basicData.workPlace) 
              ? record.basicData.workPlace 
              : [record.basicData.workPlace];
            
            return recordWorkPlaces.some(recordWorkPlace => 
              userWorkPlaces.some(userWorkPlace => 
                userWorkPlace && recordWorkPlace && (
                  userWorkPlace.toLowerCase().includes(recordWorkPlace.toLowerCase()) ||
                  recordWorkPlace.toLowerCase().includes(userWorkPlace.toLowerCase())
                )
              )
            );
          });
        }
      }

      if (filters.selectedInspectors && filters.selectedInspectors.length > 0) {
        if (!filters.selectedInspectors.includes('الكل')) {
          filtered = filtered.filter(record => {
            const recordInspectors = Array.isArray(record.basicData.inspectorName) 
              ? record.basicData.inspectorName 
              : [record.basicData.inspectorName];
            
            return recordInspectors.some(inspector => 
              filters.selectedInspectors.some((selectedInspector: string) => 
                inspector && selectedInspector && 
                inspector.toLowerCase().includes(selectedInspector.toLowerCase())
              )
            );
          });
        }
      }
    }

    // Apply date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(record => 
        record.basicData.date >= filters.dateFrom
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(record => 
        record.basicData.date <= filters.dateTo
      );
    }

    // Apply text filters
    if (filters.institutionName) {
      filtered = filtered.filter(record => 
        record.basicData.institutionName.toLowerCase().includes(filters.institutionName.toLowerCase())
      );
    }

    if (filters.inspectionLocation) {
      filtered = filtered.filter(record => 
        record.basicData.inspectionLocation.toLowerCase().includes(filters.inspectionLocation.toLowerCase())
      );
    }

    if (filters.violationText) {
      filtered = filtered.filter(record => 
        matchesViolationText(record, filters.violationText)
      );
    }

    console.log('Final filtered records:', filtered.length);
    return filtered;
  }, [records, currentUser, isMyRecordsView, toString, filters, matchesViolationText]);

  return { filteredRecords };
};
