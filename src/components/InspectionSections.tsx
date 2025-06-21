import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Users, FileText, ShoppingCart, Shield, AlertTriangle, Package } from 'lucide-react';
import { InspectionItem, ShortageItem, StagnantItem, ExpiredItem, RandomInventoryItem } from '@/types';
import { AttachmentUpload } from '@/components/AttachmentUpload';
import { ViolationListButton } from '@/components/ViolationListButton';
import { ViolationCategory } from '@/types/violations';

interface InspectionSectionsProps {
  data: any;
  onChange: (data: any) => void;
}

export const InspectionSections: React.FC<InspectionSectionsProps> = ({ data, onChange }) => {
  const addInspectionItem = (section: string) => {
    const newItem: InspectionItem = {
      violation: '',
      actionTaken: '',
      responsible: '',
      attachments: []
    };
    
    onChange({
      ...data,
      [section]: [...(data[section] || []), newItem]
    });
  };

  const updateInspectionItem = (section: string, index: number, field: string, value: string) => {
    const items = [...(data[section] || [])];
    items[index] = { ...items[index], [field]: value };
    onChange({
      ...data,
      [section]: items
    });
  };

  const updateInspectionItemAttachments = (section: string, index: number, attachments: any[]) => {
    const items = [...(data[section] || [])];
    items[index] = { ...items[index], attachments };
    onChange({
      ...data,
      [section]: items
    });
  };

  const removeInspectionItem = (section: string, index: number) => {
    const items = [...(data[section] || [])];
    items.splice(index, 1);
    onChange({
      ...data,
      [section]: items
    });
  };

  // إصلاح دالة إضافة المخالفات
  const createViolationSelectHandler = (sectionName: string) => {
    return (violations: string[]) => {
      console.log('Adding violations to section:', sectionName, violations);
      const currentItems = [...(data[sectionName] || [])];
      
      violations.forEach(violation => {
        const newItem: InspectionItem = {
          violation: violation,
          actionTaken: '',
          responsible: '',
          attachments: []
        };
        currentItems.push(newItem);
      });

      onChange({
        ...data,
        [sectionName]: currentItems
      });
    };
  };

  const addInventoryItem = (type: 'shortages' | 'stagnant' | 'expired' | 'randomInventory') => {
    let newItem: any;
    
    switch (type) {
      case 'shortages':
        newItem = { item: '', unit: '', requiredQuantity: '', attachments: [] };
        break;
      case 'stagnant':
      case 'expired':
        newItem = { item: '', unit: '', quantity: '', expiryDate: '', attachments: [] };
        break;
      case 'randomInventory':
        newItem = { item: '', unit: '', bookBalance: '', dispensed: '', actualBalance: '', shortage: '', surplus: '' };
        break;
    }

    onChange({
      ...data,
      inventoryManagement: {
        ...data.inventoryManagement,
        [type]: [...(data.inventoryManagement?.[type] || []), newItem]
      }
    });
  };

  const updateInventoryItem = (type: string, index: number, field: string, value: any) => {
    const items = [...(data.inventoryManagement?.[type] || [])];
    items[index] = { ...items[index], [field]: value };
    onChange({
      ...data,
      inventoryManagement: {
        ...data.inventoryManagement,
        [type]: items
      }
    });
  };

  const removeInventoryItem = (type: string, index: number) => {
    const items = [...(data.inventoryManagement?.[type] || [])];
    items.splice(index, 1);
    onChange({
      ...data,
      inventoryManagement: {
        ...data.inventoryManagement,
        [type]: items
      }
    });
  };

  const addInventoryViolation = () => {
    const newItem: InspectionItem = {
      violation: '',
      actionTaken: '',
      responsible: '',
      attachments: []
    };
    
    if (!data.inventoryViolations) {
      onChange({
        ...data,
        inventoryViolations: [newItem]
      });
    } else {
      onChange({
        ...data,
        inventoryViolations: [...data.inventoryViolations, newItem]
      });
    }
  };

  const handleInventoryViolationSelect = (violations: string[]) => {
    console.log('Adding inventory violations:', violations);
    const currentViolations = [...(data.inventoryViolations || [])];
    
    violations.forEach(violation => {
      const newItem: InspectionItem = {
        violation: violation,
        actionTaken: '',
        responsible: '',
        attachments: []
      };
      currentViolations.push(newItem);
    });

    onChange({
      ...data,
      inventoryViolations: currentViolations
    });
  };

  const renderInspectionSection = (title: string, section: string, icon: React.ReactNode, category: ViolationCategory) => (
    <Card className="mb-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button 
              onClick={() => addInspectionItem(section)} 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all text-lg font-bold rounded-xl"
            >
              <Plus className="h-5 w-5 ml-2" />
              إضافة مخالفة
            </Button>
            <ViolationListButton 
              category={category} 
              onViolationSelect={createViolationSelectHandler(section)}
            />
          </div>
          <CardTitle className="text-lg md:text-xl flex items-center">
            {icon}
            <span className="mr-3 font-bold text-gray-800">{title}</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8 bg-gray-50/30">
        {(data[section] || []).map((item: InspectionItem, index: number) => (
          <div key={index} className="border-2 border-gray-200 rounded-2xl p-6 mb-6 bg-white shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <Button
                onClick={() => removeInspectionItem(section, index)}
                variant="outline"
                size="lg"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-200 hover:border-red-300 w-full sm:w-auto transition-all shadow-sm rounded-xl font-bold"
              >
                <Trash2 className="h-5 w-5" />
                <span className="mr-2 sm:hidden">حذف</span>
              </Button>
              <h4 className="font-bold text-xl text-gray-700 bg-blue-100 px-4 py-2 rounded-xl border border-blue-200">المخالفة #{index + 1}</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <Label className="text-right block mb-3 text-lg font-bold text-gray-700">وصف المخالفة</Label>
                <Textarea
                  value={item.violation}
                  onChange={(e) => updateInspectionItem(section, index, 'violation', e.target.value)}
                  className="text-right border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-lg p-4 shadow-sm bg-white transition-all"
                  rows={4}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-right block mb-3 text-lg font-bold text-gray-700">الإجراء المتخذ</Label>
                <Textarea
                  value={item.actionTaken}
                  onChange={(e) => updateInspectionItem(section, index, 'actionTaken', e.target.value)}
                  className="text-right border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-lg p-4 shadow-sm bg-white transition-all"
                  rows={4}
                />
              </div>
              <div className="lg:col-span-2 space-y-3">
                <Label className="text-right block mb-3 text-lg font-bold text-gray-700">
                  المسؤول <span className="text-sm text-gray-500 font-normal">(يمكنك إضافة أكثر من اسم)</span>
                </Label>
                <Input
                  value={item.responsible}
                  onChange={(e) => updateInspectionItem(section, index, 'responsible', e.target.value)}
                  className="text-right h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-lg shadow-sm bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <Label className="text-right block mb-3 text-lg font-bold text-gray-700">المرفقات</Label>
              <AttachmentUpload
                attachments={item.attachments || []}
                onAttachmentsChange={(attachments) => updateInspectionItemAttachments(section, index, attachments)}
                maxFiles={5}
                maxSizeInMB={5}
              />
            </div>
          </div>
        ))}
        
        {(!data[section] || data[section].length === 0) && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-xl font-semibold">لا توجد مخالفات مسجلة في هذا القسم</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 font-['Cairo',_'Segoe_UI',_'Tahoma',_sans-serif]">
      {/* القوة البشرية */}
      {renderInspectionSection('القوة البشرية', 'humanResources', <Users className="h-6 w-6 text-blue-600" />, 'humanResources')}
      
      {/* الدفاتر والمستندات */}
      {renderInspectionSection('الدفاتر والمستندات', 'documentsAndBooks', <FileText className="h-6 w-6 text-green-600" />, 'documentsAndBooks')}
      
      {/* سياسات الصرف والقوائم */}
      {renderInspectionSection('سياسات الصرف والقوائم', 'dispensingPolicies', <ShoppingCart className="h-6 w-6 text-purple-600" />, 'dispensingPolicies')}
      
      {/* الاشتراطات الصحية والتخزين */}
      {renderInspectionSection('الاشتراطات الصحية والتخزين', 'storageAndHealth', <Package className="h-6 w-6 text-orange-600" />, 'storageAndHealth')}

      {/* إدارة المخزون */}
      <Card className="mb-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button 
                onClick={addInventoryViolation} 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transition-all text-lg font-bold rounded-xl"
              >
                <Plus className="h-5 w-5 ml-2" />
                إضافة مخالفة
              </Button>
              <ViolationListButton 
                category="inventoryManagement" 
                onViolationSelect={handleInventoryViolationSelect}
              />
            </div>
            <CardTitle className="text-lg md:text-xl text-right flex items-center">
              <Package className="h-6 w-6 text-orange-600" />
              <span className="mr-3 font-bold text-gray-800">إدارة المخزون</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-8 bg-gray-50/30">
          {/* مخالفات إدارة المخزون */}
          {data.inventoryViolations && data.inventoryViolations.length > 0 && (
            <div>
              <h4 className="font-bold text-xl text-gray-700 mb-6 border-b-2 border-orange-200 pb-2">مخالفات إدارة المخزون</h4>
              {data.inventoryViolations.map((item: InspectionItem, index: number) => (
                <div key={index} className="border-2 border-gray-200 rounded-2xl p-6 mb-6 bg-white shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <Button
                      onClick={() => {
                        const items = [...data.inventoryViolations];
                        items.splice(index, 1);
                        onChange({ ...data, inventoryViolations: items });
                      }}
                      variant="outline"
                      size="lg"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-200 w-full sm:w-auto rounded-xl font-bold"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="mr-2 sm:hidden">حذف</span>
                    </Button>
                    <h5 className="font-bold text-lg text-gray-600 bg-orange-100 px-4 py-2 rounded-xl border border-orange-200">المخالفة #{index + 1}</h5>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <Label className="text-right block mb-3 text-lg font-bold text-gray-700">وصف المخالفة</Label>
                      <Textarea
                        value={item.violation}
                        onChange={(e) => {
                          const items = [...data.inventoryViolations];
                          items[index] = { ...items[index], violation: e.target.value };
                          onChange({ ...data, inventoryViolations: items });
                        }}
                        className="text-right border-2 border-gray-300 focus:border-orange-500 rounded-xl text-lg p-4 bg-white transition-all"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-right block mb-3 text-lg font-bold text-gray-700">الإجراء المتخذ</Label>
                      <Textarea
                        value={item.actionTaken}
                        onChange={(e) => {
                          const items = [...data.inventoryViolations];
                          items[index] = { ...items[index], actionTaken: e.target.value };
                          onChange({ ...data, inventoryViolations: items });
                        }}
                        className="text-right border-2 border-gray-300 focus:border-orange-500 rounded-xl text-lg p-4 bg-white transition-all"
                        rows={4}
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-3">
                      <Label className="text-right block mb-3 text-lg font-bold text-gray-700">
                        المسؤول <span className="text-sm text-gray-500 font-normal">(يمكنك إضافة أكثر من اسم)</span>
                      </Label>
                      <Input
                        value={item.responsible}
                        onChange={(e) => {
                          const items = [...data.inventoryViolations];
                          items[index] = { ...items[index], responsible: e.target.value };
                          onChange({ ...data, inventoryViolations: items });
                        }}
                        className="text-right h-12 border-2 border-gray-300 focus:border-orange-500 rounded-xl text-lg bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-right block mb-3 text-lg font-bold text-gray-700">المرفقات</Label>
                    <AttachmentUpload
                      attachments={item.attachments || []}
                      onAttachmentsChange={(attachments) => {
                        const items = [...data.inventoryViolations];
                        items[index] = { ...items[index], attachments };
                        onChange({ ...data, inventoryViolations: items });
                      }}
                      maxFiles={5}
                      maxSizeInMB={5}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* النواقص */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <Button 
                onClick={() => addInventoryItem('shortages')} 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all rounded-xl font-bold"
              >
                <Plus className="h-5 w-5 ml-2" />
                إضافة نقص
              </Button>
              <h4 className="font-bold text-xl text-gray-700 bg-red-100 px-4 py-2 rounded-xl border border-red-200">النواقص</h4>
            </div>
            
            {(data.inventoryManagement?.shortages || []).map((item: ShortageItem, index: number) => (
              <div key={index} className="border-2 border-red-200 rounded-2xl p-6 mb-6 bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <Button
                    onClick={() => removeInventoryItem('shortages', index)}
                    variant="outline"
                    size="lg"
                    className="text-red-600 border-2 border-red-200 hover:bg-red-50 w-full sm:w-auto rounded-xl font-bold"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="mr-2 sm:hidden">حذف</span>
                  </Button>
                  <h5 className="font-bold text-lg text-red-600 bg-red-100 px-4 py-2 rounded-xl border border-red-200">النقص #{index + 1}</h5>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-right block mb-2 text-lg font-bold text-gray-700">الصنف</Label>
                    <Input
                      value={item.item}
                      onChange={(e) => updateInventoryItem('shortages', index, 'item', e.target.value)}
                      className="text-right h-12 border-2 border-gray-300 focus:border-red-500 rounded-xl text-lg bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-right block mb-2 text-lg font-bold text-gray-700">الوحدة</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateInventoryItem('shortages', index, 'unit', e.target.value)}
                      className="text-right h-12 border-2 border-gray-300 focus:border-red-500 rounded-xl text-lg bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-right block mb-2 text-lg font-bold text-gray-700">الكمية المطلوبة</Label>
                    <Input
                      value={item.requiredQuantity}
                      onChange={(e) => updateInventoryItem('shortages', index, 'requiredQuantity', e.target.value)}
                      className="text-right h-12 border-2 border-gray-300 focus:border-red-500 rounded-xl text-lg bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* الرواكد */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <Button 
                onClick={() => addInventoryItem('stagnant')} 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all rounded-xl font-bold"
              >
                <Plus className="h-5 w-5 ml-2" />
                إضافة راكد
              </Button>
              <h4 className="font-bold text-xl text-gray-700 bg-yellow-100 px-4 py-2 rounded-xl border border-yellow-200">الرواكد</h4>
            </div>
            
            {(data.inventoryManagement?.stagnant || []).map((item: StagnantItem, index: number) => (
              <div key={index} className="border-2 border-yellow-200 rounded-2xl p-6 mb-6 bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <Button
                    onClick={() => removeInventoryItem('stagnant', index)}
                    variant="outline"
                    size="lg"
                    className="text-red-600 border-2 border-red-200 hover:bg-red-50 w-full sm:w-auto rounded-xl font-bold"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="mr-2 sm:hidden">حذف</span>
                  </Button>
                  <h5 className="font-bold text-lg text-yellow-600 bg-yellow-100 px-4 py-2 rounded-xl border border-yellow-200">الراكد #{index + 1}</h5>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <Label className="text-right block mb-2 text-lg font-bold text-gray-700">الصنف</Label>
                    <Input
                      value={item.item}
                      onChange={(e) => updateInventoryItem('stagnant', index, 'item', e.target.value)}
                      className="text-right h-12 border-2 border-gray-300 focus:border-yellow-500 rounded-xl text-lg bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-right block mb-2 text-lg font-bold text-gray-700">الوحدة</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateInventoryItem('stagnant', index, 'unit', e.target.value)}
                      className="text-right h-12 border-2 border-gray-300 focus:border-yellow-500 rounded-xl text-lg bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-right block mb-2 text-lg font-bold text-gray-700">الكمية</Label>
                    <Input
                      value={item.quantity}
                      onChange={(e) => updateInventoryItem('stagnant', index, 'quantity', e.target.value)}
                      className="text-right h-12 border-2 border-gray-300 focus:border-yellow-500 rounded-xl text-lg bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-right block mb-2 text-lg font-bold text-gray-700">تاريخ الانتهاء</Label>
                    <Input
                      type="date"
                      value={item.expiryDate}
                      onChange={(e) => updateInventoryItem('stagnant', index, 'expiryDate', e.target.value)}
                      className="text-right h-12 border-2 border-gray-300 focus:border-yellow-500 rounded-xl text-lg bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* المنتهي الصلاحية */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <Button 
                onClick={() => addInventoryItem('expired')} 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all rounded-xl font-bold"
              >
                <Plus className="h-5 w-5 ml-2" />
                إضافة منتهي الصلاحية
              </Button>
              <h4 className="font-bold text-xl text-gray-700 bg-red-100 px-4 py-2 rounded-xl border border-red-200">منتهي الصلاحية</h4>
            </div>
            
            {(data.inventoryManagement?.expired || []).map((item: ExpiredItem, index: number) => (
              <div key={index} className="border-2 border-red-200 rounded-2xl p-6 mb-6 bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <Button
                    onClick={() => removeInventoryItem('expired', index)}
                    variant="outline"
                    size="lg"
                    className="text-red-600 border-2 border-red-200 hover:bg-red-50 w-full sm:w-auto rounded-xl font-bold"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="mr-2 sm:hidden">حذف</span>
                  </Button>
                  <h5 className="font-bold text-lg text-red-600 bg-red-100 px-4 py-2 rounded-xl border border-red-200">المنتهي الصلاحية #{index + 1}</h5>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <Label className="text-right block mb-2 text-lg font-bold text-gray-700">الصنف</Label>
                    <Input
                      value={item.item}
                      onChange={(e) => updateInventoryItem('expired', index, 'item', e.target.value)}
                      className="text-right h-12 border-2 border-gray-300 focus:border-red-500 rounded-xl text-lg bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-right block mb-2 text-lg font-bold text-gray-700">الوحدة</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateInventoryItem('expired', index, 'unit', e.target.value)}
                      className="text-right h-12 border-2 border-gray-300 focus:border-red-500 rounded-xl text-lg bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-right block mb-2 text-lg font-bold text-gray-700">الكمية</Label>
                    <Input
                      value={item.quantity}
                      onChange={(e) => updateInventoryItem('expired', index, 'quantity', e.target.value)}
                      className="text-right h-12 border-2 border-gray-300 focus:border-red-500 rounded-xl text-lg bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-right block mb-2 text-lg font-bold text-gray-700">تاريخ الانتهاء</Label>
                    <Input
                      type="date"
                      value={item.expiryDate}
                      onChange={(e) => updateInventoryItem('expired', index, 'expiryDate', e.target.value)}
                      className="text-right h-12 border-2 border-gray-300 focus:border-red-500 rounded-xl text-lg bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* الجرد العشوائي */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <Button 
                onClick={() => addInventoryItem('randomInventory')} 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all rounded-xl font-bold"
              >
                <Plus className="h-5 w-5 ml-2" />
                إضافة جرد عشوائي
              </Button>
              <h4 className="font-bold text-xl text-gray-700 bg-blue-100 px-4 py-2 rounded-xl border border-blue-200">الجرد العشوائي</h4>
            </div>
            
            {(data.inventoryManagement?.randomInventory || []).map((item: RandomInventoryItem, index: number) => (
              <div key={index} className="border-2 border-blue-200 rounded-2xl p-6 mb-6 bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <Button
                    onClick={() => removeInventoryItem('randomInventory', index)}
                    variant="outline"
                    size="lg"
                    className="text-red-600 border-2 border-red-200 hover:bg-red-50 w-full sm:w-auto rounded-xl font-bold"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="mr-2 sm:hidden">حذف</span>
                  </Button>
                  <h5 className="font-bold text-lg text-blue-600 bg-blue-100 px-4 py-2 rounded-xl border border-blue-200">الجرد العشوائي #{index + 1}</h5>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                  <div className="space-y-2">
                    <Label className="text-right block mb-2 text-sm font-bold text-gray-700">الصنف</Label>
                    <Input
                      value={item.item}
                      onChange={(e) => updateInventoryItem('randomInventory', index, 'item', e.target.value)}
                      className="text-right h-10 border-2 border-gray-300 focus:border-blue-500 rounded-lg text-sm bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block mb-2 text-sm font-bold text-gray-700">الوحدة</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateInventoryItem('randomInventory', index, 'unit', e.target.value)}
                      className="text-right h-10 border-2 border-gray-300 focus:border-blue-500 rounded-lg text-sm bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block mb-2 text-sm font-bold text-gray-700">رصيد الدفتر</Label>
                    <Input
                      value={item.bookBalance}
                      onChange={(e) => updateInventoryItem('randomInventory', index, 'bookBalance', e.target.value)}
                      className="text-right h-10 border-2 border-gray-300 focus:border-blue-500 rounded-lg text-sm bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block mb-2 text-sm font-bold text-gray-700">المصروف</Label>
                    <Input
                      value={item.dispensed}
                      onChange={(e) => updateInventoryItem('randomInventory', index, 'dispensed', e.target.value)}
                      className="text-right h-10 border-2 border-gray-300 focus:border-blue-500 rounded-lg text-sm bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block mb-2 text-sm font-bold text-gray-700">الرصيد الفعلي</Label>
                    <Input
                      value={item.actualBalance}
                      onChange={(e) => updateInventoryItem('randomInventory', index, 'actualBalance', e.target.value)}
                      className="text-right h-10 border-2 border-gray-300 focus:border-blue-500 rounded-lg text-sm bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block mb-2 text-sm font-bold text-gray-700">العجز</Label>
                    <Input
                      value={item.shortage}
                      onChange={(e) => updateInventoryItem('randomInventory', index, 'shortage', e.target.value)}
                      className="text-right h-10 border-2 border-gray-300 focus:border-blue-500 rounded-lg text-sm bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right block mb-2 text-sm font-bold text-gray-700">الزيادة</Label>
                    <Input
                      value={item.surplus}
                      onChange={(e) => updateInventoryItem('randomInventory', index, 'surplus', e.target.value)}
                      className="text-right h-10 border-2 border-gray-300 focus:border-blue-500 rounded-lg text-sm bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الأمن والسلامة */}
      {renderInspectionSection('الأمن والسلامة', 'securityAndSafety', <Shield className="h-6 w-6 text-red-600" />, 'securityAndSafety')}
      
      {/* مخالفات أخرى */}
      {renderInspectionSection('مخالفات أخرى', 'otherViolations', <AlertTriangle className="h-6 w-6 text-yellow-600" />, 'otherViolations')}
    </div>
  );
};
