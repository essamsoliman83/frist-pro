
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Calendar, User, Building2, AlertTriangle, MapPin } from 'lucide-react';
import { MultiSelect } from '@/components/MultiSelect';
import { InventorySelect } from '@/components/InventorySelect';

interface SearchFormProps {
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onSearch: () => void;
  onReset: () => void;
  showMultiSelectFields?: boolean;
  showInspectorNameField?: boolean;
  availableWorkPlaces?: string[];
  availableInspectors?: string[];
  isMyView?: boolean;
  currentUser?: any;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  filters,
  onFilterChange,
  onReset,
  showMultiSelectFields = false,
  showInspectorNameField = true,
  availableWorkPlaces = [],
  availableInspectors = [],
  isMyView = false,
  currentUser
}) => {
  // عدم إظهار الحقول المتعددة في الأقسام الشخصية للمفتشين
  const shouldShowMultiSelectFields = showMultiSelectFields && !isMyView;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-right">فلاتر البحث</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* حقل التاريخ من */}
          <div className="space-y-2">
            <Label className="text-right flex items-center">
              <Calendar className="ml-2 h-4 w-4" />
              من تاريخ
            </Label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              className="text-right"
            />
          </div>

          {/* حقل التاريخ إلى */}
          <div className="space-y-2">
            <Label className="text-right flex items-center">
              <Calendar className="ml-2 h-4 w-4" />
              إلى تاريخ
            </Label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFilterChange('dateTo', e.target.value)}
              className="text-right"
            />
          </div>

          {/* حقل اسم المفتش - يظهر في الأقسام الشخصية فقط كحقل غير قابل للتعديل */}
          {isMyView && currentUser && (
            <div className="space-y-2">
              <Label className="text-right flex items-center">
                <User className="ml-2 h-4 w-4" />
                اسم المفتش
              </Label>
              <Input
                value={currentUser.name || ''}
                readOnly
                className="text-right bg-gray-100 cursor-not-allowed"
                placeholder="اسم المفتش (ثابت)"
              />
            </div>
          )}

          {/* حقل اسم المفتش للبحث العام */}
          {showInspectorNameField && !isMyView && !shouldShowMultiSelectFields && (
            <div className="space-y-2">
              <Label className="text-right flex items-center">
                <User className="ml-2 h-4 w-4" />
                اسم المفتش
              </Label>
              <Input
                value={filters.inspectorName || ''}
                onChange={(e) => onFilterChange('inspectorName', e.target.value)}
                placeholder="ابحث باسم المفتش"
                className="text-right"
              />
            </div>
          )}

          {/* حقل اسم المؤسسة - يظهر دائماً */}
          <div className="space-y-2">
            <Label className="text-right flex items-center">
              <Building2 className="ml-2 h-4 w-4" />
              اسم المؤسسة
            </Label>
            <Input
              value={filters.institutionName || ''}
              onChange={(e) => onFilterChange('institutionName', e.target.value)}
              placeholder="ابحث باسم المؤسسة"
              className="text-right"
            />
          </div>

          {/* حقل مكان التفتيش - يظهر دائماً */}
          <div className="space-y-2">
            <Label className="text-right flex items-center">
              <MapPin className="ml-2 h-4 w-4" />
              مكان التفتيش
            </Label>
            <Input
              value={filters.inspectionLocation || ''}
              onChange={(e) => onFilterChange('inspectionLocation', e.target.value)}
              placeholder="ابحث بمكان التفتيش"
              className="text-right"
            />
          </div>

          {/* حقل البحث في المخالفات - يظهر دائماً في جميع الحالات */}
          <div className="space-y-2">
            <Label className="text-right flex items-center">
              <AlertTriangle className="ml-2 h-4 w-4" />
              البحث في المخالفات
            </Label>
            <Input
              value={filters.violationText || ''}
              onChange={(e) => onFilterChange('violationText', e.target.value)}
              placeholder="ابحث في نص المخالفات"
              className="text-right"
            />
          </div>

          {/* قائمة جهات العمل المتعددة - تظهر فقط في البحث العام للمدير والمسؤول */}
          {shouldShowMultiSelectFields && (
            <div className="space-y-2">
              <Label className="text-right flex items-center">
                <Building2 className="ml-2 h-4 w-4" />
                جهات العمل
              </Label>
              <MultiSelect
                options={availableWorkPlaces}
                selected={filters.selectedWorkPlaces || []}
                onChange={(values) => onFilterChange('selectedWorkPlaces', values)}
                placeholder="اختر جهات العمل"
              />
            </div>
          )}

          {/* قائمة المفتشين المتعددة - تظهر فقط في البحث العام عند اختيار جهات العمل */}
          {shouldShowMultiSelectFields && filters.selectedWorkPlaces?.length > 0 && (
            <div className="space-y-2">
              <Label className="text-right flex items-center">
                <User className="ml-2 h-4 w-4" />
                المفتشون
              </Label>
              <MultiSelect
                options={availableInspectors}
                selected={filters.selectedInspectors || []}
                onChange={(values) => onFilterChange('selectedInspectors', values)}
                placeholder="اختر المفتشين"
              />
            </div>
          )}

          {/* حقل إدارة المخزون - يظهر فقط في البحث العام للمدير والمسؤول */}
          {shouldShowMultiSelectFields && (
            <InventorySelect
              value={filters.inventoryType || ''}
              onChange={(value) => onFilterChange('inventoryType', value)}
              placeholder="اختر نوع إدارة المخزون"
            />
          )}
        </div>

        {/* زر إعادة التعيين فقط */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onReset} variant="outline" className="flex items-center">
            <RotateCcw className="ml-2 h-4 w-4" />
            إعادة تعيين
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
