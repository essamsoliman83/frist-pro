
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useViolationLists } from '@/hooks/useViolationLists';
import { ViolationCategory, VIOLATION_CATEGORIES } from '@/types/violations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, Plus, Edit, Trash2, Save, X, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const ViolationManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const {
    violationsBySection,
    addViolationToSection,
    updateViolationInSection,
    deleteViolationFromSection
  } = useViolationLists();

  const [isViolationDialogOpen, setIsViolationDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ViolationCategory | null>(null);
  const [editingViolation, setEditingViolation] = useState<{ id: string; title: string } | null>(null);

  const [violationFormData, setViolationFormData] = useState({
    title: ''
  });

  const resetViolationForm = () => {
    console.log('Resetting violation form');
    setViolationFormData({ title: '' });
    setEditingViolation(null);
  };

  const handleCreateViolation = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleCreateViolation called');
    console.log('selectedSection:', selectedSection);
    console.log('violationFormData:', violationFormData);
    console.log('editingViolation:', editingViolation);

    if (!selectedSection) {
      console.error('No section selected');
      toast({
        title: "خطأ",
        description: "لم يتم تحديد القسم",
        variant: "destructive",
      });
      return;
    }

    if (!violationFormData.title || violationFormData.title.trim() === '') {
      console.error('No violation title provided');
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المخالفة",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingViolation) {
        console.log('Updating existing violation');
        updateViolationInSection(selectedSection, editingViolation.id, violationFormData.title.trim());
        toast({
          title: "تم تحديث المخالفة بنجاح",
          description: `تم تحديث ${violationFormData.title}`,
        });
      } else {
        console.log('Adding new violation');
        addViolationToSection(selectedSection, violationFormData.title.trim());
        toast({
          title: "تم إضافة المخالفة بنجاح",
          description: `تم إضافة ${violationFormData.title}`,
        });
      }
      
      console.log('Operation completed successfully');
      resetViolationForm();
      setSelectedSection(null);
      setIsViolationDialogOpen(false);
    } catch (error) {
      console.error('Error in handleCreateViolation:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ المخالفة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteViolation = (section: ViolationCategory, violationId: string, violationTitle: string) => {
    console.log('Deleting violation:', section, violationId, violationTitle);
    if (window.confirm(`هل أنت متأكد من حذف المخالفة "${violationTitle}"؟`)) {
      deleteViolationFromSection(section, violationId);
      toast({
        title: "تم الحذف",
        description: `تم حذف المخالفة ${violationTitle}`,
      });
    }
  };

  const handleEditViolation = (section: ViolationCategory, violation: { id: string; title: string }) => {
    console.log('Editing violation:', section, violation);
    setSelectedSection(section);
    setEditingViolation(violation);
    setViolationFormData({
      title: violation.title
    });
    setIsViolationDialogOpen(true);
  };

  const handleAddNewViolation = (section: ViolationCategory) => {
    console.log('Adding new violation for section:', section);
    // إعداد الحالة قبل فتح الحوار
    setSelectedSection(section);
    setEditingViolation(null);
    setViolationFormData({ title: '' });
    // فتح الحوار بعد تعيين القسم
    setTimeout(() => {
      setIsViolationDialogOpen(true);
    }, 0);
  };

  const handleDialogClose = () => {
    console.log('Dialog closing');
    setIsViolationDialogOpen(false);
    setSelectedSection(null);
    resetViolationForm();
  };

  if (currentUser?.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">غير مصرح لك بالوصول</h1>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button onClick={() => navigate('/')} variant="ghost" className="hover:bg-slate-100">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للرئيسية
              </Button>
              <div className="flex items-center">
                <List className="ml-2 h-6 w-6 text-indigo-600" />
                <h1 className="text-xl font-bold text-slate-800">إدارة بيان المخالفات</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {(Object.entries(VIOLATION_CATEGORIES) as [ViolationCategory, string][]).map(([section, sectionName]) => (
            <Card key={section}>
              <CardHeader>
                <CardTitle className="text-right flex justify-between items-center">
                  <span>{sectionName} ({violationsBySection[section]?.length || 0} مخالفة)</span>
                  <Button
                    onClick={() => handleAddNewViolation(section)}
                    size="sm"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة مخالفة
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم المخالفة</TableHead>
                      <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {violationsBySection[section]?.map((violation) => (
                      <TableRow key={violation.id}>
                        <TableCell className="text-right font-medium">{violation.title}</TableCell>
                        <TableCell className="text-right">{new Date(violation.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex space-x-2 space-x-reverse">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditViolation(section, violation)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteViolation(section, violation.id, violation.title)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!violationsBySection[section] || violationsBySection[section].length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                          لا توجد مخالفات في هذا القسم
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isViolationDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-right">
              {editingViolation ? 'تعديل المخالفة' : 'إضافة مخالفة جديدة'}
              {selectedSection && (
                <span className="text-sm text-gray-500 block mt-1">
                  القسم: {VIOLATION_CATEGORIES[selectedSection]}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateViolation} className="space-y-4">
            <div>
              <Label className="text-right block mb-2">اسم المخالفة</Label>
              <Input
                value={violationFormData.title}
                onChange={(e) => {
                  console.log('Input value changed:', e.target.value);
                  setViolationFormData(prev => ({ ...prev, title: e.target.value }));
                }}
                className="text-right"
                required
                placeholder="أدخل اسم المخالفة"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDialogClose}
              >
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
              <Button type="submit">
                <Save className="ml-2 h-4 w-4" />
                {editingViolation ? 'حفظ التغييرات' : 'إضافة المخالفة'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
