
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, PREDEFINED_SUPERVISORY_WORKPLACES } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, Plus, Edit, Trash2, Save, X, Users, Crown, Shield, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect } from '@/components/MultiSelect';

export const UserManagement: React.FC = () => {
  const { currentUser, users, addUser, updateUser, deleteUser } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'inspector' as User['role'],
    workPlace: [] as string[],
    administrativeWorkPlaces: [] as string[]
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'inspector',
      workPlace: [],
      administrativeWorkPlaces: []
    });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userData: any = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        workPlace: formData.workPlace.length > 0 ? formData.workPlace.join(', ') : ''
      };

      // إضافة جهات العمل الإشرافية للمديرين والمسؤولين
      if ((formData.role === 'manager' || formData.role === 'supervisor') && formData.administrativeWorkPlaces.length > 0) {
        userData.administrativeWorkPlaces = formData.administrativeWorkPlaces;
      }

      if (editingUser) {
        updateUser(editingUser.id, userData);
        toast({
          title: "تم تحديث المستخدم بنجاح",
          description: `تم تحديث بيانات ${formData.name}`,
        });
      } else {
        addUser(userData);
        toast({
          title: "تم إضافة المستخدم بنجاح",
          description: `تم إضافة ${formData.name} بنجاح`,
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const workPlaceArray = user.workPlace ? user.workPlace.split(', ').filter(wp => wp.trim()) : [];
    setFormData({
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
      workPlace: workPlaceArray,
      administrativeWorkPlaces: user.administrativeWorkPlaces || []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      toast({
        title: "خطأ",
        description: "لا يمكنك حذف حسابك الحالي",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
      deleteUser(user.id);
      toast({
        title: "تم الحذف",
        description: `تم حذف المستخدم ${user.name}`,
      });
    }
  };

  // تصنيف المستخدمين حسب الدور
  const managers = users.filter(user => user.role === 'manager');
  const supervisors = users.filter(user => user.role === 'supervisor');
  const inspectors = users.filter(user => user.role === 'inspector');

  // تصنيف المفتشين حسب جهة العمل
  const inspectorsByWorkplace = inspectors.reduce((acc, inspector) => {
    if (inspector.workPlace) {
      // تقسيم جهات العمل إذا كانت متعددة ومفصولة بفاصلة
      const workplaces = inspector.workPlace.split(',').map(wp => wp.trim());
      workplaces.forEach(workplace => {
        if (!acc[workplace]) {
          acc[workplace] = [];
        }
        acc[workplace].push(inspector);
      });
    } else {
      // إضافة المفتشين بدون جهة عمل إلى فئة "غير محدد"
      if (!acc['غير محدد']) {
        acc['غير محدد'] = [];
      }
      acc['غير محدد'].push(inspector);
    }
    return acc;
  }, {} as Record<string, User[]>);

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

  const UserTable = ({ users, title, icon }: { users: User[], title: string, icon: React.ReactNode }) => (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-xl text-right flex items-center gap-3">
          {icon}
          {title} ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                <TableHead className="text-right font-semibold text-slate-700">الاسم</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">اسم المستخدم</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">جهة العمل</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">جهات العمل الإشرافية</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-indigo-50 transition-colors">
                  <TableCell className="text-right font-medium text-slate-800">{user.name}</TableCell>
                  <TableCell className="text-right text-slate-700">{user.username}</TableCell>
                  <TableCell className="text-right text-slate-700">{user.workPlace || '-'}</TableCell>
                  <TableCell className="text-right text-slate-700">
                    {user.administrativeWorkPlaces && user.administrativeWorkPlaces.length > 0 ? (
                      <div className="space-y-1">
                        {user.administrativeWorkPlaces.map((workPlace, index) => (
                          <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1">
                            {workPlace}
                          </span>
                        ))}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex space-x-2 space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="hover:bg-blue-50 border-blue-200 text-blue-600 hover:border-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-slate-500">
            لا يوجد مستخدمين في هذه الفئة
          </div>
        )}
      </CardContent>
    </Card>
  );

  const InspectorWorkplaceTable = ({ workplace, inspectors }: { workplace: string, inspectors: User[] }) => (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-t-lg">
        <CardTitle className="text-lg text-right flex items-center gap-3">
          <UserCheck className="h-5 w-5" />
          {workplace} ({inspectors.length} مفتش)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-100">
              <TableHead className="text-right font-semibold text-slate-700">الاسم</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">اسم المستخدم</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspectors.map((user) => (
              <TableRow key={user.id} className="hover:bg-green-50 transition-colors">
                <TableCell className="text-right font-medium text-slate-800">{user.name}</TableCell>
                <TableCell className="text-right text-slate-700">{user.username}</TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      className="hover:bg-blue-50 border-blue-200 text-blue-600 hover:border-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user.id !== currentUser?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

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
                <Users className="ml-2 h-6 w-6 text-indigo-600" />
                <h1 className="text-xl font-bold text-slate-800">إدارة المستخدمين</h1>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all duration-200 hover:scale-105"
                >
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة مستخدم جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-right text-slate-800">
                    {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* حقول اساسية */}
                  <div>
                    <Label className="text-right block mb-2 text-slate-700">اسم المستخدم</Label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="text-right border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2 text-slate-700">كلمة المرور</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="text-right border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2 text-slate-700">الاسم الكامل</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-right border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-right block mb-2 text-slate-700">الدور</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as User['role'] }))}>
                      <SelectTrigger className="text-right border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inspector">مفتش</SelectItem>
                        <SelectItem value="supervisor">مسؤول</SelectItem>
                        <SelectItem value="manager">مدير</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* جهات العمل للجميع */}
                  <div>
                    <Label className="text-right block mb-2 text-slate-700">جهات العمل</Label>
                    <MultiSelect
                      options={[...PREDEFINED_SUPERVISORY_WORKPLACES]}
                      selected={formData.workPlace}
                      onChange={(selected) => setFormData(prev => ({ ...prev, workPlace: selected }))}
                      placeholder="اختر جهات العمل"
                    />
                  </div>

                  {/* جهات العمل الإشرافية للمديرين والمسؤولين */}
                  {(formData.role === 'manager' || formData.role === 'supervisor') && (
                    <div>
                      <Label className="text-right block mb-3 text-slate-700">جهات العمل الإشرافية</Label>
                      <MultiSelect
                        options={[...PREDEFINED_SUPERVISORY_WORKPLACES]}
                        selected={formData.administrativeWorkPlaces}
                        onChange={(selected) => setFormData(prev => ({ ...prev, administrativeWorkPlaces: selected }))}
                        placeholder="اختر جهات العمل الإشرافية"
                      />
                      <p className="text-xs text-slate-500 mt-2 text-right">
                        تم اختيار {formData.administrativeWorkPlaces.length} من أصل {PREDEFINED_SUPERVISORY_WORKPLACES.length} جهة
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      <X className="ml-2 h-4 w-4" />
                      إلغاء
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      <Save className="ml-2 h-4 w-4" />
                      {editingUser ? 'حفظ التغييرات' : 'إضافة المستخدم'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* جدول المديرين */}
        <UserTable 
          users={managers} 
          title="المديرين" 
          icon={<Crown className="h-6 w-6" />}
        />

        {/* جدول المسؤولين */}
        <UserTable 
          users={supervisors} 
          title="المسؤولين" 
          icon={<Shield className="h-6 w-6" />}
        />

        {/* جداول المفتشين حسب جهة العمل - جدول منفصل لكل جهة عمل */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 text-right mb-6">المفتشين حسب جهة العمل</h2>
          <div className="space-y-6">
            {Object.entries(inspectorsByWorkplace).map(([workplace, workplaceInspectors]) => (
              <InspectorWorkplaceTable
                key={workplace}
                workplace={workplace}
                inspectors={workplaceInspectors}
              />
            ))}
            {Object.keys(inspectorsByWorkplace).length === 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8 text-center text-slate-500">
                  لا يوجد مفتشين مسجلين في النظام
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
