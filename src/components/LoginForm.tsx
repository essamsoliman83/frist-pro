
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LogIn, Shield } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (login(username, password)) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في نظام التفتيش الصيدلي",
        });
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "اسم المستخدم أو كلمة المرور غير صحيحة",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 p-2 sm:p-4 font-['Cairo',_'Segoe_UI',_'Tahoma',_sans-serif]">
      <div className="w-full max-w-md px-4 sm:px-0">
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-2xl">
            <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-2 sm:mb-3">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              نظام التفتيش الصيدلي
            </span>
          </h1>
          <p className="text-lg sm:text-xl font-bold">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              الحكومي
            </span>
          </p>
        </div>

        <Card className="shadow-2xl border-2 border-gray-200 bg-white/95 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-2 px-4 sm:px-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-xl sm:text-2xl text-right text-slate-800 flex items-center justify-center font-bold">
              <LogIn className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-right text-slate-600 text-base sm:text-lg mt-2 font-medium">
              أدخل بيانات الدخول للوصول إلى النظام
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-right block text-slate-700 font-bold text-base sm:text-lg">
                  اسم المستخدم
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="text-right h-12 sm:h-14 border-2 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base sm:text-lg rounded-xl shadow-sm"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block text-slate-700 font-bold text-base sm:text-lg">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-right h-12 sm:h-14 border-2 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base sm:text-lg rounded-xl shadow-sm"
                  placeholder="أدخل كلمة المرور"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-lg sm:text-xl font-bold shadow-xl transition-all duration-200 hover:scale-105 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white ml-2"></div>
                    <span className="text-base sm:text-lg">جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-base sm:text-lg">تسجيل الدخول</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
