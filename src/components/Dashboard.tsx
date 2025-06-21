
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, FileText, Search, Users, BarChart3, Download, Upload, List, User } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const getDashboardItems = () => {
    const baseItems = [
      {
        title: 'إنشاء محضر جديد',
        description: 'إنشاء محضر تفتيش جديد',
        icon: FileText,
        path: '/create-record',
        color: 'from-emerald-500 to-teal-600',
        hoverColor: 'hover:from-emerald-600 hover:to-teal-700'
      },
      {
        title: currentUser?.role === 'inspector' ? 'محاضري' : 'محاضر المفتشين',
        description: currentUser?.role === 'inspector' ? 'عرض محاضري' : 'البحث والاستعلام عن محاضر المفتشين',
        icon: currentUser?.role === 'inspector' ? User : Search,
        path: '/search-records',
        color: 'from-indigo-500 to-purple-600',
        hoverColor: 'hover:from-indigo-600 hover:to-purple-700'
      },
      {
        title: currentUser?.role === 'inspector' ? 'تقاريري' : 'تقارير المفتشين',
        description: currentUser?.role === 'inspector' ? 'عرض تقاريري' : 'عرض تقارير وإحصائيات المفتشين',
        icon: BarChart3,
        path: '/reports',
        color: 'from-amber-500 to-orange-600',
        hoverColor: 'hover:from-amber-600 hover:to-orange-700'
      }
    ];

    // إضافة أقسام إضافية للمسؤول والمدير
    if (currentUser?.role === 'supervisor' || currentUser?.role === 'manager') {
      baseItems.push(
        {
          title: 'محاضري',
          description: 'عرض محاضري الشخصية',
          icon: User,
          path: '/search-records?view=my-records',
          color: 'from-teal-500 to-cyan-600',
          hoverColor: 'hover:from-teal-600 hover:to-cyan-700'
        },
        {
          title: 'تقاريري',
          description: 'عرض تقاريري الشخصية',
          icon: BarChart3,
          path: '/reports?view=my-reports',
          color: 'from-orange-500 to-red-600',
          hoverColor: 'hover:from-orange-600 hover:to-red-700'
        }
      );
    }

    if (currentUser?.role === 'manager') {
      baseItems.push(
        {
          title: 'إدارة المستخدمين',
          description: 'إضافة وإدارة حسابات المستخدمين',
          icon: Users,
          path: '/user-management',
          color: 'from-rose-500 to-pink-600',
          hoverColor: 'hover:from-rose-600 hover:to-pink-700'
        },
        {
          title: 'قوائم المخالفات',
          description: 'إدارة وإضافة قوائم المخالفات للأقسام المختلفة',
          icon: List,
          path: '/violation-management',
          color: 'from-cyan-500 to-blue-600',
          hoverColor: 'hover:from-cyan-600 hover:to-blue-700'
        },
        {
          title: 'النسخ الاحتياطي',
          description: 'إنشاء واستعادة النسخ الاحتياطية للبيانات',
          icon: Download,
          path: '/backup-restore',
          color: 'from-violet-500 to-purple-600',
          hoverColor: 'hover:from-violet-600 hover:to-purple-700'
        }
      );
    }

    return baseItems;
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'inspector': return 'مفتش';
      case 'supervisor': return 'مسؤول';
      case 'manager': return 'مدير';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'inspector': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 font-['Cairo',_'Segoe_UI',_'Tahoma',_sans-serif]">
      {/* Header */}
      <div className="bg-white shadow-xl border-b-2 border-slate-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                <Shield className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-2xl font-bold">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    نظام التفتيش الصيدلي الحكومي
                  </span>
                </h1>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-sm font-bold">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    نظام التفتيش
                  </span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
              <div className="text-right">
                <p className="text-sm sm:text-lg font-bold text-slate-800 truncate max-w-20 sm:max-w-none">{currentUser?.name}</p>
                <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-bold ${getRoleBadgeColor(currentUser?.role || '')}`}>
                  {getRoleDisplayName(currentUser?.role || '')}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="lg"
                className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-sm sm:text-base px-3 sm:px-4 font-bold shadow-md rounded-xl"
              >
                <LogOut className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
                <span className="sm:hidden">خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-10">
        <div className="mb-8 sm:mb-12 text-center sm:text-right">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-2 sm:mb-4">
            مرحباً، <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">{currentUser?.name}</span>
          </h2>
          <p className="text-slate-600 text-lg sm:text-xl font-medium">
            اختر الخدمة المطلوبة من الخيارات أدناه
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {getDashboardItems().map((item, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-xl group rounded-2xl overflow-hidden"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-8 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className={`w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r ${item.color} ${item.hoverColor} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-right text-slate-800 group-hover:text-indigo-600 transition-colors px-1 font-bold">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-right text-slate-600 text-sm sm:text-base px-1 font-medium">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
