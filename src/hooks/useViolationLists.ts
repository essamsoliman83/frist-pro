
import { useState, useEffect } from 'react';
import { ViolationsBySection, ViolationCategory, ViolationItem } from '@/types/violations';

export const useViolationLists = () => {
  const [violationsBySection, setViolationsBySection] = useState<ViolationsBySection>({
    humanResources: [],
    documentsAndBooks: [],
    dispensingPolicies: [],
    storageAndHealth: [],
    inventoryManagement: [],
    securityAndSafety: [],
    otherViolations: []
  });

  useEffect(() => {
    const stored = localStorage.getItem('violationsBySection');
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        console.log('Loaded violations from localStorage:', parsedData);
        setViolationsBySection(parsedData);
      } catch (error) {
        console.error('Error parsing violations from localStorage:', error);
        initializeDefaultViolations();
      }
    } else {
      console.log('No violations found in localStorage, using defaults');
      initializeDefaultViolations();
    }
  }, []);

  const initializeDefaultViolations = () => {
    const defaultViolations: ViolationsBySection = {
      humanResources: [
        {
          id: '1',
          title: 'عدم وجود صيدلي مسؤول مرخص',
          description: 'عدم وجود صيدلي مسؤول مرخص',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'عدم تواجد الصيدلي المسؤول أثناء ساعات العمل',
          description: 'عدم تواجد الصيدلي المسؤول أثناء ساعات العمل',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      documentsAndBooks: [
        {
          id: '3',
          title: 'عدم وجود دفتر المواعين المستحضرات',
          description: 'عدم وجود دفتر المواعين المستحضرات',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      dispensingPolicies: [],
      storageAndHealth: [],
      inventoryManagement: [],
      securityAndSafety: [],
      otherViolations: []
    };
    
    saveToStorage(defaultViolations);
  };

  const saveToStorage = (data: ViolationsBySection) => {
    try {
      console.log('Saving violations to localStorage:', data);
      localStorage.setItem('violationsBySection', JSON.stringify(data));
      setViolationsBySection(data);
      console.log('Successfully saved to localStorage');
    } catch (error) {
      console.error('Error saving violations to localStorage:', error);
    }
  };

  const addViolationToSection = (section: ViolationCategory, title: string) => {
    console.log('addViolationToSection called with:', { section, title });
    
    if (!section || !title || title.trim() === '') {
      console.error('Invalid parameters for addViolationToSection');
      return;
    }

    const newViolation: ViolationItem = {
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: title.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating new violation:', newViolation);

    const currentSectionViolations = violationsBySection[section] || [];
    console.log('Current section violations:', currentSectionViolations);

    const updated = {
      ...violationsBySection,
      [section]: [...currentSectionViolations, newViolation]
    };

    console.log('Updated violations data:', updated);
    saveToStorage(updated);
  };

  const updateViolationInSection = (section: ViolationCategory, violationId: string, title: string) => {
    console.log('updateViolationInSection called with:', { section, violationId, title });
    
    if (!section || !violationId || !title || title.trim() === '') {
      console.error('Invalid parameters for updateViolationInSection');
      return;
    }

    const updated = {
      ...violationsBySection,
      [section]: violationsBySection[section].map(violation =>
        violation.id === violationId
          ? { ...violation, title: title.trim(), description: title.trim(), updatedAt: new Date().toISOString() }
          : violation
      )
    };
    
    console.log('Updated violations data:', updated);
    saveToStorage(updated);
  };

  const deleteViolationFromSection = (section: ViolationCategory, violationId: string) => {
    console.log('deleteViolationFromSection called with:', { section, violationId });
    
    if (!section || !violationId) {
      console.error('Invalid parameters for deleteViolationFromSection');
      return;
    }

    const updated = {
      ...violationsBySection,
      [section]: violationsBySection[section].filter(violation => violation.id !== violationId)
    };
    
    console.log('Updated violations data after deletion:', updated);
    saveToStorage(updated);
  };

  const getViolationsByCategory = (category: ViolationCategory) => {
    const violations = violationsBySection[category] || [];
    console.log('Getting violations for category:', category, violations);
    return violations;
  };

  // Legacy compatibility
  const violationLists: any[] = [];
  const addViolationList = () => {};
  const updateViolationList = () => {};
  const deleteViolationList = () => {};
  const addViolationToList = () => {};
  const updateViolationInList = () => {};
  const deleteViolationFromList = () => {};

  return {
    violationsBySection,
    addViolationToSection,
    updateViolationInSection,
    deleteViolationFromSection,
    getViolationsByCategory,
    // Legacy compatibility
    violationLists,
    addViolationList,
    updateViolationList,
    deleteViolationList,
    addViolationToList,
    updateViolationInList,
    deleteViolationFromList,
    getViolationListsByCategory: getViolationsByCategory
  };
};
