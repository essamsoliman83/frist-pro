
import { useState, useEffect } from 'react';
import { getInspectorsByWorkplacesFromUsers } from '@/data/inspectors';
import { PREDEFINED_SUPERVISORY_WORKPLACES } from '@/types';

export const useSearchFilters = (currentUser: any, users: any[], isMyRecordsView: boolean) => {
  const getInitialFilters = () => {
    const baseFilters = {
      dateFrom: '',
      dateTo: '',
      inspectorName: isMyRecordsView ? (currentUser?.name || '') : '',
      selectedWorkPlaces: [],
      selectedInspectors: [],
      institutionName: '',
      inspectionLocation: '',
      violationText: '',
      inventoryType: ''
    };

    if (currentUser && !isMyRecordsView && currentUser.role !== 'inspector') {
      if (currentUser.role === 'supervisor') {
        let defaultWorkPlaces: string[] = [];
        if (currentUser.administrativeWorkPlaces && currentUser.administrativeWorkPlaces.length > 0) {
          defaultWorkPlaces = [...currentUser.administrativeWorkPlaces];
        } else if (currentUser.workPlace) {
          defaultWorkPlaces = [currentUser.workPlace];
        }
        baseFilters.selectedWorkPlaces = defaultWorkPlaces;
      } else if (currentUser.role === 'manager') {
        if (currentUser.administrativeWorkPlaces && currentUser.administrativeWorkPlaces.length > 0) {
          baseFilters.selectedWorkPlaces = [...currentUser.administrativeWorkPlaces];
        }
      }
    }

    return baseFilters;
  };

  const [filters, setFilters] = useState(getInitialFilters());

  useEffect(() => {
    const newFilters = getInitialFilters();
    setFilters(newFilters);
  }, [currentUser, isMyRecordsView]);

  const getAvailableInspectors = (): string[] => {
    if (filters.selectedWorkPlaces.length === 0) {
      return [];
    }
    
    const inspectors = getInspectorsByWorkplacesFromUsers(users, filters.selectedWorkPlaces);
    
    if (currentUser && (currentUser.role === 'manager' || currentUser.role === 'supervisor') && inspectors.length > 0) {
      return ['الكل', ...inspectors];
    }
    
    return inspectors;
  };

  const getAvailableWorkPlaces = (): string[] => {
    if (currentUser?.role === 'manager') {
      if (currentUser.administrativeWorkPlaces && currentUser.administrativeWorkPlaces.length > 0) {
        return currentUser.administrativeWorkPlaces;
      }
      return [...PREDEFINED_SUPERVISORY_WORKPLACES];
    } else if (currentUser?.role === 'supervisor') {
      if (currentUser.administrativeWorkPlaces && currentUser.administrativeWorkPlaces.length > 0) {
        return currentUser.administrativeWorkPlaces;
      } else if (currentUser.workPlace) {
        return [currentUser.workPlace];
      }
    }
    return [];
  };

  const updateFilter = (key: string, value: any) => {
    if (key === 'inspectorName' && (isMyRecordsView || currentUser?.role === 'inspector')) {
      return;
    }
    
    console.log('Updating filter:', key, 'to:', value);
    
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      if (key === 'selectedWorkPlaces') {
        newFilters.selectedInspectors = [];
      }
      
      return newFilters;
    });
  };

  const handleReset = () => {
    const resetFilters = getInitialFilters();
    setFilters(resetFilters);
  };

  return {
    filters,
    setFilters,
    updateFilter,
    handleReset,
    getAvailableInspectors,
    getAvailableWorkPlaces
  };
};
