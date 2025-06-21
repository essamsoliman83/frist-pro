
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelect } from '@/components/MultiSelect';
import { PREDEFINED_SUPERVISORY_WORKPLACES } from '@/types';
import { getInspectorsByWorkplacesFromUsers } from '@/data/inspectors';
import { Filter, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ReportsFiltersProps {
  onFilterChange: (filters: any) => void;
  currentUser: any;
  isMyReports?: boolean;
}

export const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  onFilterChange,
  currentUser,
  isMyReports = false
}) => {
  const { users } = useAuth();
  
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    inspectorName: isMyReports ? (currentUser?.name || '') : '',
    selectedWorkPlaces: [],
    selectedInspectors: [],
  });

  // إعادة تعيين اسم المفتش عند تغيير حالة "تقاريري"
  useEffect(() => {
    if (isMyReports && currentUser?.name) {
      setFilters(prev => ({
        ...prev,
        inspectorName: currentUser.name
      }));
    }
  }, [isMyReports, currentUser]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // الحصول على قائمة المفتشين المتاحة بناءً على جهات العمل المحددة
  const getAvailableInspectors = (): string[] => {
    if (filters.selectedWorkPlaces.length === 0) {
      return [];
    }
    
    const inspectors = getInspectorsByWorkplacesFromUsers(users, filters.selectedWorkPlaces);
    
    // إضافة خيار "الكل" في المقدمة للمديرين والمسؤولين فقط إذا كان هناك مفتشين
    if (currentUser && (currentUser.role === 'manager' || currentUser.role === 'supervisor') && inspectors.length > 0) {
      return ['الكل', ...inspectors];
    }
    
    return inspectors;
  };

  // الحصول على قائمة جهات العمل المتاحة
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
    // منع تعديل اسم المفتش في قسم "تقاريري"
    if (key === 'inspectorName' && isMyReports) {
      return;
    }
    
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      if (key === 'selectedWorkPlaces') {
        newFilters.selectedInspectors = [];
      }
      
      return newFilters;
    });
  };

  const handleReset = () => {
    const resetFilters = {
      dateFrom: '',
      dateTo: '',
      inspectorName: isMyReports ? (currentUser?.name || '') : '',
      selectedWorkPlaces: [],
      selectedInspectors: [],
    };
    setFilters(resetFilters);
  };

  // عرض القوائم المنسدلة المتعددة للمدير والمسؤول في البحث العام فقط (ليس في قسم "تقاريري")
  const showMultiSelectFields = currentUser && 
    (currentUser.role === 'manager' || currentUser.role === 'supervisor') && 
    !isMyReports;

  // عرض حقل اسم المفتش للمفتش دائماً أو للمدير والمسؤول في قسم "تقاريري"
  const showInspectorNameField = currentUser?.role === 'inspector' || isMyReports;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-right flex items-center justify-end">
          <span className="ml-2">{isMyReports ? 'فلترة تقاريري' : 'فلترة التقارير'}</span>
          <Filter className="h-5 w-5" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-right block mb-2">من تاريخ</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="text-right"
            />
          </div>

          <div>
            <Label className="text-right block mb-2">إلى تاريخ</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="text-right"
            />
          </div>

          {showMultiSelectFields && (
            <>
              <div className="md:col-span-2 lg:col-span-1">
                <Label className="text-right block mb-2">جهات العمل</Label>
                <MultiSelect
                  options={getAvailableWorkPlaces()}
                  selected={filters.selectedWorkPlaces}
                  onChange={(selected) => updateFilter('selectedWorkPlaces', selected)}
                  placeholder="اختر جهات العمل"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <Label className="text-right block mb-2">أسماء المفتشين</Label>
                <MultiSelect
                  options={getAvailableInspectors()}
                  selected={filters.selectedInspectors}
                  onChange={(selected) => updateFilter('selectedInspectors', selected)}
                  placeholder={filters.selectedWorkPlaces.length === 0 ? "اختر جهة العمل أولاً" : "اختر المفتشين"}
                />
                {filters.selectedWorkPlaces.length === 0 && (
                  <p className="text-sm text-orange-600 text-right mt-1">
                    يجب اختيار جهة العمل أولاً لإظهار المفتشين
                  </p>
                )}
              </div>
            </>
          )}

          {showInspectorNameField && (
            <div>
              <Label className="text-right block mb-2">اسم المفتش</Label>
              <Input
                value={filters.inspectorName}
                readOnly={isMyReports}
                onChange={(e) => updateFilter('inspectorName', e.target.value)}
                placeholder="اسم المفتش"
                className={`text-right ${isMyReports ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {isMyReports && (
                <p className="text-sm text-blue-600 text-right mt-1">
                  هذا هو اسمك - لا يمكن تعديله
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 space-x-reverse mt-6">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex items-center"
          >
            <RotateCcw className="ml-2 h-4 w-4" />
            إعادة تعيين
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
