
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Building2, MapPin, FileSearch, UserCheck } from 'lucide-react';
import { MultiSelect } from '@/components/MultiSelect';
import { getAllInspectorsFromUsers, getInspectorsByWorkplacesFromUsers } from '@/data/inspectors';
import { useAuth } from '@/contexts/AuthContext';

// قائمة جهات العمل المحددة
const WORK_PLACES = [
  'إدارة الصيدلة بكفرالشيخ',
  'مركز سيدي غازي',
  'مركز دسوق',
  'مركز سيدي سالم',
  'مركز قلين',
  'مركز فوة',
  'مركز مطوبس',
  'مركز الرياض',
  'مركز الحامول',
  'مركز بيلا',
  'مركز بلطيم'
];

interface BasicDataFormProps {
  formData: any;
  onBasicDataChange: (field: string, value: string | string[]) => void;
}

export const BasicDataForm: React.FC<BasicDataFormProps> = ({
  formData,
  onBasicDataChange
}) => {
  const { users, currentUser } = useAuth();

  // تحويل workPlace و inspectorName إلى مصفوفات إذا لم تكن كذلك
  const selectedWorkPlaces = Array.isArray(formData.basicData.workPlace) 
    ? formData.basicData.workPlace 
    : formData.basicData.workPlace ? [formData.basicData.workPlace] : [];

  const selectedInspectors = Array.isArray(formData.basicData.inspectorName)
    ? formData.basicData.inspectorName
    : formData.basicData.inspectorName ? [formData.basicData.inspectorName] : [];

  // الحصول على المفتشين المتاحين بناءً على جهات العمل المحددة
  const getAvailableInspectors = (): string[] => {
    // إذا لم يتم تحديد أي جهة عمل، لا نعرض أي مفتشين
    if (selectedWorkPlaces.length === 0) {
      return [];
    }
    
    // الحصول على المفتشين بناءً على جهات العمل المحددة
    let inspectors = getInspectorsByWorkplacesFromUsers(users, selectedWorkPlaces);
    
    // إضافة المدير أو المسؤول فقط إذا كانت جهة العمل المحددة تتطابق مع جهة عملهم الأساسية وليس الإشرافية
    users.forEach(user => {
      if ((user.role === 'manager' || user.role === 'supervisor') && user.name && user.workPlace) {
        // التحقق من تطابق جهة العمل الأساسية فقط (وليس الإشرافية)
        const hasMatchingBasicWorkplace = selectedWorkPlaces.some(selectedWorkplace =>
          user.workPlace && (
            user.workPlace.toLowerCase().includes(selectedWorkplace.toLowerCase()) ||
            selectedWorkplace.toLowerCase().includes(user.workPlace.toLowerCase())
          )
        );
        
        if (hasMatchingBasicWorkplace && !inspectors.includes(user.name)) {
          inspectors.push(user.name);
        }
      }
    });
    
    return inspectors;
  };

  const handleWorkPlaceChange = (workplaces: string[]) => {
    onBasicDataChange('workPlace', workplaces);
    
    // تصفية المفتشين المحددين بناءً على جهات العمل الجديدة
    if (workplaces.length === 0) {
      // إذا لم يتم تحديد أي جهة عمل، مسح المفتشين المحددين
      onBasicDataChange('inspectorName', []);
    } else {
      // تصفية المفتشين المحددين بناءً على جهات العمل الجديدة
      const newAvailableInspectors = getInspectorsByWorkplacesFromUsers(users, workplaces);
      
      // إضافة المدير أو المسؤول فقط إذا كانت جهة العمل تتطابق مع جهة عملهم الأساسية
      users.forEach(user => {
        if ((user.role === 'manager' || user.role === 'supervisor') && user.name && user.workPlace) {
          const hasMatchingBasicWorkplace = workplaces.some(selectedWorkplace =>
            user.workPlace && (
              user.workPlace.toLowerCase().includes(selectedWorkplace.toLowerCase()) ||
              selectedWorkplace.toLowerCase().includes(user.workPlace.toLowerCase())
            )
          );
          
          if (hasMatchingBasicWorkplace && !newAvailableInspectors.includes(user.name)) {
            newAvailableInspectors.push(user.name);
          }
        }
      });
      
      const filteredInspectors = selectedInspectors.filter(inspector => 
        newAvailableInspectors.includes(inspector)
      );
      onBasicDataChange('inspectorName', filteredInspectors);
    }
  };

  return (
    <div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 sm:mb-8 text-right flex items-center border-b-2 border-blue-200 pb-3 sm:pb-4">
        <User className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
        البيانات الأساسية
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* التاريخ والوقت */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-right block text-base sm:text-lg font-semibold flex items-center text-gray-700">
            <Calendar className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            اليوم
          </Label>
          <Input
            value={formData.basicData.day}
            onChange={(e) => onBasicDataChange('day', e.target.value)}
            className="text-right h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base sm:text-lg shadow-sm"
            placeholder="مثال: الأحد"
          />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-right block text-base sm:text-lg font-semibold flex items-center text-gray-700">
            <Calendar className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            التاريخ
          </Label>
          <Input
            type="date"
            value={formData.basicData.date}
            onChange={(e) => onBasicDataChange('date', e.target.value)}
            className="text-right h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base sm:text-lg shadow-sm"
          />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-right block text-base sm:text-lg font-semibold flex items-center text-gray-700">
            <Clock className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            الوقت
          </Label>
          <Input
            type="time"
            value={formData.basicData.time}
            onChange={(e) => onBasicDataChange('time', e.target.value)}
            className="text-right h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base sm:text-lg shadow-sm"
          />
        </div>

        {/* جهات العمل */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-right block text-base sm:text-lg font-semibold flex items-center text-gray-700">
            <Building2 className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            جهات العمل
          </Label>
          <MultiSelect
            options={WORK_PLACES}
            selected={selectedWorkPlaces}
            onChange={handleWorkPlaceChange}
            placeholder="اختر جهات العمل"
            className="text-right"
          />
        </div>

        {/* اسم المفتش */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-right block text-base sm:text-lg font-semibold flex items-center text-gray-700">
            <User className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            اسم المفتش
          </Label>
          <MultiSelect
            options={getAvailableInspectors()}
            selected={selectedInspectors}
            onChange={(inspectors) => onBasicDataChange('inspectorName', inspectors)}
            placeholder={selectedWorkPlaces.length === 0 ? "اختر جهة العمل أولاً" : "اختر المفتشين"}
            className="text-right"
          />
          {selectedWorkPlaces.length === 0 && (
            <p className="text-sm text-orange-600 text-right">
              يجب اختيار جهة العمل أولاً لإظهار المفتشين
            </p>
          )}
          {selectedWorkPlaces.length > 0 && getAvailableInspectors().length === 0 && (
            <p className="text-sm text-orange-600 text-right">
              لا يوجد مفتشين متاحين لجهات العمل المحددة
            </p>
          )}
        </div>

        {/* باقي الحقول */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-right block text-base sm:text-lg font-semibold flex items-center text-gray-700">
            <Building2 className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            اسم المؤسسة
          </Label>
          <Input
            value={formData.basicData.institutionName}
            onChange={(e) => onBasicDataChange('institutionName', e.target.value)}
            className="text-right h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base sm:text-lg shadow-sm"
            placeholder="اسم المؤسسة"
          />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-right block text-base sm:text-lg font-semibold flex items-center text-gray-700">
            <MapPin className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            مكان التفتيش
          </Label>
          <Input
            value={formData.basicData.inspectionLocation}
            onChange={(e) => onBasicDataChange('inspectionLocation', e.target.value)}
            className="text-right h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base sm:text-lg shadow-sm"
            placeholder="مكان التفتيش"
          />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-right block text-base sm:text-lg font-semibold flex items-center text-gray-700">
            <UserCheck className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            اسم الصيدلي المتواجد
          </Label>
          <Input
            value={formData.basicData.presentPharmacist}
            onChange={(e) => onBasicDataChange('presentPharmacist', e.target.value)}
            className="text-right h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base sm:text-lg shadow-sm"
            placeholder="اسم الصيدلي المتواجد"
          />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-right block text-base sm:text-lg font-semibold flex items-center text-gray-700">
            <FileSearch className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            سبب التفتيش
          </Label>
          <Input
            value={formData.basicData.inspectionReason}
            onChange={(e) => onBasicDataChange('inspectionReason', e.target.value)}
            className="text-right h-10 sm:h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base sm:text-lg shadow-sm"
            placeholder="سبب التفتيش"
          />
        </div>
      </div>
    </div>
  );
};
