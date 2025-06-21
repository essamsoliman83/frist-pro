
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelect } from '@/components/MultiSelect';
import { InventorySelect } from '@/components/InventorySelect';
import { PREDEFINED_SUPERVISORY_WORKPLACES } from '@/types';
import { getInspectorsByWorkplacesFromUsers } from '@/data/inspectors';
import { Search, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface SearchFilters {
  dateFrom: string;
  dateTo: string;
  inspectorName: string;
  workPlace: string;
  selectedWorkPlaces: string[];
  selectedInspectors: string[];
  violationText: string;
  inventoryType: string;
}

interface SearchRecordsFormProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  isMyRecords?: boolean;
}

export const SearchRecordsForm: React.FC<SearchRecordsFormProps> = ({
  onSearch,
  initialFilters = {},
  isMyRecords = false
}) => {
  const { currentUser, users } = useAuth();
  const location = useLocation();
  
  const urlParams = new URLSearchParams(location.search);
  const isMyRecordsFromUrl = urlParams.get('view') === 'my-records';
  const actualIsMyRecords = isMyRecords || isMyRecordsFromUrl;

  console.log('SearchRecordsForm: URL params:', location.search);
  console.log('SearchRecordsForm: isMyRecordsFromUrl:', isMyRecordsFromUrl);
  console.log('SearchRecordsForm: actualIsMyRecords:', actualIsMyRecords);

  const [filters, setFilters] = useState<SearchFilters>({
    dateFrom: '',
    dateTo: '',
    inspectorName: actualIsMyRecords ? (currentUser?.name || '') : '',
    workPlace: '',
    selectedWorkPlaces: [],
    selectedInspectors: [],
    violationText: '',
    inventoryType: '',
    ...initialFilters
  });

  // إعادة تعيين اسم المفتش عند تغيير حالة "محاضري" - تثبيت الاسم
  useEffect(() => {
    if (actualIsMyRecords && currentUser?.name) {
      setFilters(prev => ({
        ...prev,
        inspectorName: currentUser.name
      }));
    }
  }, [actualIsMyRecords, currentUser]);

  // الحصول على قائمة المفتشين المتاحة بناءً على جهات العمل المحددة (المفتشين فقط)
  const getAvailableInspectors = (): string[] => {
    if (filters.selectedWorkPlaces.length === 0) {
      return [];
    }
    
    console.log('SearchRecordsForm - Getting inspectors for workplaces:', filters.selectedWorkPlaces);
    console.log('SearchRecordsForm - Available users:', users.map(u => ({ name: u.name, role: u.role })));
    
    // الحصول على المفتشين فقط من دالة الفلترة
    const inspectors = getInspectorsByWorkplacesFromUsers(users, filters.selectedWorkPlaces);
    
    console.log('SearchRecordsForm - Filtered inspectors:', inspectors);
    
    // إضافة خيار "الكل" في المقدمة للمديرين والمسؤولين فقط إذا كان هناك مفتشين
    if (currentUser && (currentUser.role === 'manager' || currentUser.role === 'supervisor') && inspectors.length > 0) {
      return ['الكل', ...inspectors];
    }
    
    return inspectors;
  };

  // الحصول على قائمة جهات العمل المتاحة (تشمل جهات العمل الإشرافية)
  const getAvailableWorkPlaces = (): string[] => {
    if (currentUser?.role === 'manager') {
      // للمدير: عرض جهات العمل الإشرافية إذا كانت محددة، وإلا جميع الجهات
      if (currentUser.administrativeWorkPlaces && currentUser.administrativeWorkPlaces.length > 0) {
        return currentUser.administrativeWorkPlaces;
      }
      return [...PREDEFINED_SUPERVISORY_WORKPLACES];
    } else if (currentUser?.role === 'supervisor') {
      // للمسؤول: عرض جهات العمل الإشرافية إذا كانت محددة، وإلا الجهات العادية
      if (currentUser.administrativeWorkPlaces && currentUser.administrativeWorkPlaces.length > 0) {
        return currentUser.administrativeWorkPlaces;
      } else if (currentUser.workPlace) {
        return [currentUser.workPlace];
      }
    }
    return [];
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      dateFrom: '',
      dateTo: '',
      inspectorName: actualIsMyRecords ? (currentUser?.name || '') : '',
      workPlace: '',
      selectedWorkPlaces: [],
      selectedInspectors: [],
      violationText: '',
      inventoryType: ''
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    // منع تعديل اسم المفتش في قسم "محاضري"
    if (key === 'inspectorName' && actualIsMyRecords) {
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

  // عرض القوائم المنسدلة المتعددة للمدير والمسؤول في البحث العام فقط (ليس في قسم "محاضري")
  const showMultiSelectFields = currentUser && 
    (currentUser.role === 'manager' || currentUser.role === 'supervisor') && 
    !actualIsMyRecords;

  // عرض حقل اسم المفتش للمفتش دائماً أو للمدير والمسؤول في قسم "محاضري"
  const showInspectorNameField = currentUser?.role === 'inspector' || actualIsMyRecords;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-right">
          {actualIsMyRecords ? 'محاضري' : 'البحث في المحاضر'}
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

              <div>
                <Label className="text-right block mb-2">البحث في المخالفات</Label>
                <Input
                  value={filters.violationText}
                  onChange={(e) => updateFilter('violationText', e.target.value)}
                  placeholder="البحث في نص المخالفات"
                  className="text-right"
                />
              </div>

              <InventorySelect
                value={filters.inventoryType}
                onChange={(value) => updateFilter('inventoryType', value)}
                placeholder="اختر نوع إدارة المخزون"
              />
            </>
          )}

          {showInspectorNameField && (
            <div>
              <Label className="text-right block mb-2">اسم المفتش</Label>
              <Input
                value={filters.inspectorName}
                readOnly={actualIsMyRecords}
                onChange={(e) => updateFilter('inspectorName', e.target.value)}
                placeholder="اسم المفتش"
                className={`text-right ${actualIsMyRecords ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {actualIsMyRecords && (
                <p className="text-sm text-blue-600 text-right mt-1">
                  هذا هو اسمك - لا يمكن تعديله
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 space-x-reverse mt-6">
          {currentUser?.role === 'manager' && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex items-center"
            >
              <RotateCcw className="ml-2 h-4 w-4" />
              إعادة تعيين
            </Button>
          )}
          <Button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center"
          >
            <Search className="ml-2 h-4 w-4" />
            بحث
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
