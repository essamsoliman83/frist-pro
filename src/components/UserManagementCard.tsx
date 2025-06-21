
import React, { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Save, X, Shield, Crown, User as UserIcon } from 'lucide-react';
import { MultiSelect } from '@/components/MultiSelect';
import { PREDEFINED_SUPERVISORY_WORKPLACES } from '@/types';
import { getInspectorsByWorkplaces } from '@/data/inspectors';

interface UserManagementCardProps {
  user: User;
  onUpdate: (id: string, updates: Partial<User>) => void;
  onDelete: (id: string) => void;
}

export const UserManagementCard: React.FC<UserManagementCardProps> = ({
  user,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>(user);

  const handleSave = () => {
    onUpdate(user.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(user);
    setIsEditing(false);
  };

  const getAvailableInspectors = () => {
    if (editData.workPlace) {
      return getInspectorsByWorkplaces([editData.workPlace]);
    }
    return [];
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager':
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case 'supervisor':
        return <Shield className="h-5 w-5 text-blue-600" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager':
        return 'مدير';
      case 'supervisor':
        return 'مسؤول';
      default:
        return 'مفتش';
    }
  };

  const getWorkPlaceDisplay = () => {
    if ((user.role === 'supervisor' || user.role === 'manager') && user.administrativeWorkPlaces) {
      return user.administrativeWorkPlaces.join(', ');
    }
    return user.workPlace || 'غير محدد';
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getRoleIcon(user.role)}
            <div>
              <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-600">{getRoleLabel(user.role)}</p>
            </div>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => onDelete(user.id)}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label className="text-right block mb-2">اسم المستخدم</Label>
              <Input
                value={editData.username || ''}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                className="text-right"
              />
            </div>
            
            <div>
              <Label className="text-right block mb-2">الاسم الكامل</Label>
              <Input
                value={editData.name || ''}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="text-right"
              />
            </div>

            <div>
              <Label className="text-right block mb-2">الدور</Label>
              <Select
                value={editData.role}
                onValueChange={(value: 'inspector' | 'supervisor' | 'manager') => {
                  setEditData({ 
                    ...editData, 
                    role: value,
                    workPlace: value === 'inspector' ? editData.workPlace : undefined,
                    administrativeWorkPlaces: (value === 'supervisor' || value === 'manager') ? editData.administrativeWorkPlaces || [] : undefined
                  });
                }}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspector">مفتش</SelectItem>
                  <SelectItem value="supervisor">مسؤول</SelectItem>
                  <SelectItem value="manager">مدير</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(editData.role === 'supervisor' || editData.role === 'manager') ? (
              <div>
                <Label className="text-right block mb-2">جهات العمل الإشرافية</Label>
                <MultiSelect
                  options={[...PREDEFINED_SUPERVISORY_WORKPLACES]}
                  selected={editData.administrativeWorkPlaces || []}
                  onChange={(selected) => setEditData({ ...editData, administrativeWorkPlaces: selected })}
                  placeholder="اختر جهات العمل الإشرافية"
                />
              </div>
            ) : (
              <div>
                <Label className="text-right block mb-2">جهة العمل</Label>
                <Select
                  value={editData.workPlace || ''}
                  onValueChange={(value) => setEditData({ ...editData, workPlace: value })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر جهة العمل" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_SUPERVISORY_WORKPLACES.map((workplace) => (
                      <SelectItem key={workplace} value={workplace}>
                        {workplace}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
                <Save className="ml-2 h-4 w-4" />
                حفظ
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">اسم المستخدم</p>
              <p className="font-medium">{user.username}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">
                {(user.role === 'supervisor' || user.role === 'manager') ? 'جهات العمل الإشرافية' : 'جهة العمل'}
              </p>
              <p className="font-medium break-words">{getWorkPlaceDisplay()}</p>
            </div>

            {/* عرض المفتشين المرتبطين للمفتشين فقط */}
            {user.role === 'inspector' && (
              <div>
                <p className="text-sm text-gray-600 mb-2">المفتشين المرتبطين</p>
                <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                  {getAvailableInspectors().length > 0 ? (
                    <div className="space-y-1">
                      {getAvailableInspectors().map((inspector, index) => (
                        <div
                          key={index}
                          className={`text-sm p-2 rounded ${
                            inspector === user.name
                              ? 'bg-blue-100 text-blue-800 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          {inspector}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">لا توجد مفتشين مرتبطين</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
