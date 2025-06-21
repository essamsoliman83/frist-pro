import React, { useState, useMemo } from 'react';
import { useInspectionRecords } from '@/hooks/useInspectionRecords';
import { useAuth } from '@/contexts/AuthContext';
import { ReportsFilters } from '@/components/ReportsFilters';
import { ReportsStatistics } from '@/components/ReportsStatistics';
import { RecordsList } from '@/components/RecordsList';
import { Button } from '@/components/ui/button';
import { Home, Download, FileText, Calendar, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export const Reports: React.FC = () => {
  const { records, toString } = useInspectionRecords();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [filters, setFilters] = useState<any>({});
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeStatistics: true,
    includeRecordsList: true,
    includeViolations: true,
    fileName: 'تقرير_احصائيات_التفتيش'
  });

  // تحديد ما إذا كان هذا عرض "تقاريري"
  const searchParams = new URLSearchParams(location.search);
  const isMyReportsView = searchParams.get('view') === 'my-reports';

  // دالة للتحقق من تطابق جهة العمل
  const workplaceMatches = (recordWorkPlaces: string | string[], userWorkPlaces: string[]): boolean => {
    const recordWorkPlacesList = Array.isArray(recordWorkPlaces) ? recordWorkPlaces : [recordWorkPlaces];
    
    return recordWorkPlacesList.some(recordWorkPlace => 
      userWorkPlaces.some(userWorkPlace => 
        userWorkPlace && recordWorkPlace && (
          userWorkPlace.toLowerCase().includes(recordWorkPlace.toLowerCase()) ||
          recordWorkPlace.toLowerCase().includes(userWorkPlace.toLowerCase())
        )
      )
    );
  };

  // تحديد عنوان الصفحة بناءً على نوع العرض - مطابق لاسم الأيقونة
  const getPageTitle = () => {
    if (isMyReportsView) {
      return 'تقاريري';
    }
    return currentUser?.role === 'inspector' ? 'تقاريري' : 'تقارير المفتشين';
  };

  // تحديد وصف الصفحة بناءً على نوع العرض
  const getPageDescription = () => {
    if (isMyReportsView) {
      return 'عرض إحصائيات تقارير التفتيش الخاصة بي';
    }
    return currentUser?.role === 'inspector' ? 'عرض إحصائيات تقارير التفتيش الخاصة بي' : 'إحصائيات شاملة عن أنشطة التفتيش';
  };

  // تحديد ما إذا كان يجب عرض البيانات أم لا
  const shouldShowData = () => {
    // عرض البيانات دائماً في قسم "تقاريري" أو للمفتشين
    if (isMyReportsView || currentUser?.role === 'inspector') {
      return true;
    }
    
    // للمديرين والمسؤولين: عرض البيانات فقط بعد اختيار جهات العمل
    return filters.selectedWorkPlaces && filters.selectedWorkPlaces.length > 0;
  };

  // دالة تصدير شاملة للإحصائيات والمحاضر
  const exportComprehensiveReport = () => {
    try {
      let htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${exportOptions.fileName}</title>
          <style>
            body {
              font-family: 'Arial', 'Tahoma', sans-serif;
              margin: 20px;
              direction: rtl;
              text-align: right;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #2563eb;
              font-size: 28px;
              margin-bottom: 10px;
            }
            .header .subtitle {
              color: #6b7280;
              font-size: 16px;
              margin-bottom: 10px;
            }
            .filters-info {
              background-color: #f3f4f6;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .filters-title {
              font-size: 18px;
              font-weight: bold;
              color: #374151;
              margin-bottom: 15px;
            }
            .statistics-section {
              margin: 30px 0;
            }
            .statistics-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin: 20px 0;
            }
            .stat-card {
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              background-color: #f9fafb;
              text-align: center;
            }
            .stat-title {
              font-size: 16px;
              font-weight: bold;
              color: #374151;
              margin-bottom: 10px;
            }
            .stat-value {
              font-size: 32px;
              font-weight: bold;
              color: #2563eb;
            }
            .records-section {
              margin: 30px 0;
            }
            .section-title {
              font-size: 22px;
              font-weight: bold;
              color: #1f2937;
              margin: 30px 0 20px 0;
              border-bottom: 2px solid #d1d5db;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 14px;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 12px;
              text-align: right;
            }
            th {
              background-color: #f3f4f6;
              font-weight: bold;
              color: #374151;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              border-top: 2px solid #e5e7eb;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; font-size: 12px; }
              .header h1 { font-size: 24px; }
              .stat-value { font-size: 24px; }
              .section-title { font-size: 18px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${exportOptions.fileName}</h1>
            <div class="subtitle">${getPageTitle()}</div>
            <p><strong>تاريخ التصدير:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
            <p><strong>المستخدم:</strong> ${currentUser?.name}</p>
          </div>
          
          <div class="filters-info">
            <div class="filters-title">معلومات الفترة والفلاتر المطبقة:</div>
            <p><strong>نوع التقرير:</strong> ${getPageDescription()}</p>
            ${filters.dateFrom ? `<p><strong>من تاريخ:</strong> ${filters.dateFrom}</p>` : ''}
            ${filters.dateTo ? `<p><strong>إلى تاريخ:</strong> ${filters.dateTo}</p>` : ''}
            ${filters.selectedWorkPlaces?.length ? `<p><strong>جهات العمل:</strong> ${filters.selectedWorkPlaces.join(', ')}</p>` : ''}
            ${filters.selectedInspectors?.length ? `<p><strong>المفتشين:</strong> ${filters.selectedInspectors.join(', ')}</p>` : ''}
            <p><strong>إجمالي عدد المحاضر في الفترة:</strong> ${filteredRecords.length}</p>
          </div>`;

      if (exportOptions.includeStatistics) {
        htmlContent += `
          <div class="statistics-section">
            <div class="section-title">الإحصائيات العامة</div>
            <div class="statistics-grid">
              <div class="stat-card">
                <div class="stat-title">إجمالي المحاضر</div>
                <div class="stat-value">${statistics.totalRecords}</div>
              </div>
              <div class="stat-card">
                <div class="stat-title">إجمالي المخالفات</div>
                <div class="stat-value">${statistics.totalViolations}</div>
              </div>
              <div class="stat-card">
                <div class="stat-title">أكثر المفتشين نشاطاً</div>
                <div class="stat-value" style="font-size: 18px;">${statistics.topInspector}</div>
              </div>
            </div>
          </div>`;
      }

      if (exportOptions.includeRecordsList && filteredRecords.length > 0) {
        htmlContent += `
          <div class="records-section">
            <div class="section-title">جدول المحاضر (${filteredRecords.length})</div>
            <table>
              <thead>
                <tr>
                  <th>رقم المحضر</th>
                  <th>التاريخ</th>
                  <th>اسم المفتش</th>
                  <th>جهة العمل</th>
                  <th>اسم المؤسسة</th>
                  <th>مكان التفتيش</th>
                  <th>عدد المخالفات</th>
                </tr>
              </thead>
              <tbody>
                ${filteredRecords.map(record => `
                  <tr>
                    <td>${record.serialNumber}</td>
                    <td>${record.basicData.date}</td>
                    <td>${Array.isArray(record.basicData.inspectorName) 
                      ? record.basicData.inspectorName.join(', ') 
                      : record.basicData.inspectorName}</td>
                    <td>${Array.isArray(record.basicData.workPlace) 
                      ? record.basicData.workPlace.join(', ') 
                      : record.basicData.workPlace}</td>
                    <td>${record.basicData.institutionName}</td>
                    <td>${record.basicData.inspectionLocation}</td>
                    <td>${getViolationCount(record)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`;
      }

      htmlContent += `
          <div class="footer">
            <p>نظام إدارة محاضر التفتيش الصيدلي - إدارة الصيدلة بكفرالشيخ</p>
            <p>تم إنشاء هذا التقرير تلقائياً بتاريخ ${new Date().toLocaleString('ar-EG')}</p>
          </div>
        </body>
        </html>
      `;

      // فتح نافذة جديدة وطباعة المحتوى
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }

      setIsExportDialogOpen(false);
      toast({
        title: "تم تصدير التقرير الشامل",
        description: `تم إنشاء تقرير شامل يحتوي على ${filteredRecords.length} محضر`,
      });
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير التقرير الشامل",
        variant: "destructive",
      });
    }
  };

  const filteredRecords = useMemo(() => {
    console.log('Reports: Starting filteredRecords calculation with currentUser:', currentUser);
    console.log('Reports: All records count:', records.length);
    console.log('Reports: Current filters:', filters);
    
    // Return empty array if currentUser is not loaded yet
    if (!currentUser) {
      console.log('Reports: currentUser is null, returning empty array');
      return [];
    }

    // إذا كان المستخدم مدير أو مسؤول ولم يختر جهات عمل، لا تعرض أي بيانات
    if (!shouldShowData()) {
      console.log('Reports: Should not show data yet - no workplaces selected');
      return [];
    }
    
    let filtered = records;

    if (isMyReportsView || currentUser.role === 'inspector') {
      // فلترة المحاضر الشخصية للمفتش
      filtered = filtered.filter(record => {
        const inspectorNames = toString(record.basicData.inspectorName);
        const isMyRecord = inspectorNames.toLowerCase().includes(currentUser.name.toLowerCase());
        console.log('Reports: Personal record check for', currentUser.name, ':', isMyRecord, 'in', inspectorNames);
        return isMyRecord;
      });
    } else {
      // تطبيق فلاتر دور المستخدم للمشرفين والمديرين
      if (currentUser.role === 'supervisor') {
        console.log('Reports: Applying supervisor filters for user:', currentUser.name);
        console.log('Reports: User workplace:', currentUser.workPlace);
        console.log('Reports: User administrative workplaces:', currentUser.administrativeWorkPlaces);
        
        filtered = filtered.filter(record => {
          let userWorkPlaces: string[] = [];
          
          if (currentUser.workPlace) {
            userWorkPlaces.push(currentUser.workPlace);
          }
          
          if (currentUser.administrativeWorkPlaces && currentUser.administrativeWorkPlaces.length > 0) {
            userWorkPlaces = [...userWorkPlaces, ...currentUser.administrativeWorkPlaces];
          }
          
          console.log('Reports: Supervisor workplaces for filtering:', userWorkPlaces);
          console.log('Reports: Record workplaces:', record.basicData.workPlace);
          
          const matches = workplaceMatches(record.basicData.workPlace, userWorkPlaces);
          console.log('Reports: Workplace match result:', matches);
          return matches;
        });
      } else if (currentUser.role === 'manager') {
        console.log('Reports: Applying manager filters for user:', currentUser.name);
        console.log('Reports: Manager administrative workplaces:', currentUser.administrativeWorkPlaces);
        
        if (currentUser.administrativeWorkPlaces && currentUser.administrativeWorkPlaces.length > 0) {
          filtered = filtered.filter(record => {
            const matches = workplaceMatches(record.basicData.workPlace, currentUser.administrativeWorkPlaces!);
            console.log('Reports: Manager workplace match:', matches, 'for record:', record.basicData.workPlace);
            return matches;
          });
        }
      }

      // تطبيق فلترة جهات العمل المحددة - هذا هو الجزء المهم المفقود
      if (filters.selectedWorkPlaces && filters.selectedWorkPlaces.length > 0) {
        console.log('Reports: Applying selectedWorkPlaces filter:', filters.selectedWorkPlaces);
        filtered = filtered.filter(record => {
          const recordWorkPlaces = Array.isArray(record.basicData.workPlace) 
            ? record.basicData.workPlace 
            : [record.basicData.workPlace];
          
          const matches = recordWorkPlaces.some(workPlace => 
            filters.selectedWorkPlaces.some((selectedWorkPlace: string) => 
              workPlace && selectedWorkPlace && (
                workPlace.toLowerCase().includes(selectedWorkPlace.toLowerCase()) ||
                selectedWorkPlace.toLowerCase().includes(workPlace.toLowerCase())
              )
            )
          );
          
          console.log('Reports: Record workplaces:', recordWorkPlaces, 'matches:', matches);
          return matches;
        });
      }

      // تطبيق فلترة المفتشين المحددين
      if (filters.selectedInspectors && filters.selectedInspectors.length > 0) {
        console.log('Reports: Applying selectedInspectors filter:', filters.selectedInspectors);
        
        if (!filters.selectedInspectors.includes('الكل')) {
          filtered = filtered.filter(record => {
            const recordInspectors = Array.isArray(record.basicData.inspectorName)
              ? record.basicData.inspectorName
              : [record.basicData.inspectorName];

            const matches = recordInspectors.some(inspector =>
              filters.selectedInspectors.some((selectedInspector: string) =>
                inspector && selectedInspector &&
                inspector.toLowerCase().includes(selectedInspector.toLowerCase())
              )
            );
            console.log('Reports: Inspector filter match:', matches, 'for record inspectors:', recordInspectors);
            return matches;
          });
        }
      }
    }

    // تطبيق فلاتر التاريخ والحقول الأخرى
    if (filters.dateFrom) {
      filtered = filtered.filter(record =>
        record.basicData.date >= filters.dateFrom
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(record =>
        record.basicData.date <= filters.dateTo
      );
    }

    if (filters.institutionName) {
      filtered = filtered.filter(record =>
        record.basicData.institutionName.toLowerCase().includes(filters.institutionName.toLowerCase())
      );
    }

    if (filters.inspectionLocation) {
      filtered = filtered.filter(record =>
        record.basicData.inspectionLocation.toLowerCase().includes(filters.inspectionLocation.toLowerCase())
      );
    }

    console.log('Reports: Final filtered records count:', filtered.length);
    return filtered;
  }, [records, filters, currentUser, isMyReportsView, toString]);

  // تحديد عدد الأخطاء في المحاضر
  const getViolationCount = (record: any) => {
    let count = 0;
    if (record.inspectionResults) {
      Object.values(record.inspectionResults).forEach(items => {
        if (Array.isArray(items)) {
          count += items.length;
        }
      });
    }
    return count;
  };

  // حساب إحصائيات التقارير
  const statistics = useMemo(() => {
    let totalViolations = 0;
    let inspectorRecordCounts: { [key: string]: number } = {};

    filteredRecords.forEach(record => {
      totalViolations += getViolationCount(record);

      const inspectorNames = Array.isArray(record.basicData.inspectorName)
        ? record.basicData.inspectorName
        : [record.basicData.inspectorName];

      inspectorNames.forEach(name => {
        if (inspectorRecordCounts[name]) {
          inspectorRecordCounts[name]++;
        } else {
          inspectorRecordCounts[name] = 1;
        }
      });
    });

    let topInspector = 'لا يوجد مفتشون';
    let maxRecords = 0;

    for (const inspector in inspectorRecordCounts) {
      if (inspectorRecordCounts[inspector] > maxRecords) {
        maxRecords = inspectorRecordCounts[inspector];
        topInspector = inspector;
      }
    }

    return {
      totalRecords: filteredRecords.length,
      totalViolations: totalViolations,
      topInspector: topInspector,
    };
  }, [filteredRecords]);

  return (
    <div className="space-y-6">
      {/* زر العودة للصفحة الرئيسية */}
      <div className="flex justify-between items-center">
        <Button onClick={() => navigate('/')} variant="outline" className="flex items-center">
          <Home className="ml-2 h-4 w-4" />
          العودة للرئيسية
        </Button>
        
        {/* زر تصدير التقرير الشامل */}
        {shouldShowData() && filteredRecords.length > 0 && (
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center">
                <Download className="ml-2 h-4 w-4" />
                تصدير التقرير الشامل PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">خيارات التصدير</DialogTitle>
                <DialogDescription className="text-right">
                  اختر العناصر التي تريد تضمينها في التقرير
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-right block mb-2">اسم الملف</Label>
                  <Input
                    value={exportOptions.fileName}
                    onChange={(e) => setExportOptions(prev => ({...prev, fileName: e.target.value}))}
                    className="text-right"
                    placeholder="اسم الملف"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="statistics"
                      checked={exportOptions.includeStatistics}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({...prev, includeStatistics: checked as boolean}))
                      }
                    />
                    <Label htmlFor="statistics">تضمين الإحصائيات</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="recordsList"
                      checked={exportOptions.includeRecordsList}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({...prev, includeRecordsList: checked as boolean}))
                      }
                    />
                    <Label htmlFor="recordsList">تضمين جدول المحاضر</Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex justify-end space-x-2 space-x-reverse">
                <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={exportComprehensiveReport} className="bg-green-600 hover:bg-green-700">
                  <FileText className="ml-2 h-4 w-4" />
                  تصدير التقرير
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
        <p className="text-gray-600">
          {getPageDescription()}
        </p>
      </div>

      <ReportsFilters 
        onFilterChange={setFilters} 
        currentUser={currentUser}
        isMyReports={isMyReportsView || currentUser?.role === 'inspector'}
      />

      {/* رسالة توجيهية للمديرين والمسؤولين */}
      {!shouldShowData() && currentUser && (currentUser.role === 'manager' || currentUser.role === 'supervisor') && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
          <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900 mb-3">
            اختر جهات العمل لعرض التقارير
          </h3>
          <p className="text-blue-700 text-lg">
            يرجى اختيار جهة العمل أو أكثر من الفلاتر أعلاه لعرض التقارير والإحصائيات المتعلقة بها
          </p>
        </div>
      )}

      {/* عرض الإحصائيات والبيانات فقط عند استيفاء الشروط */}
      {shouldShowData() && (
        <>
          <ReportsStatistics statistics={statistics} />

          {/* معلومات إضافية عن الفترة المحددة */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                معلومات الفترة المحددة
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{filteredRecords.length}</div>
                <div className="text-sm text-gray-600">إجمالي المحاضر</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {filters.dateFrom || 'غير محدد'}
                </div>
                <div className="text-sm text-gray-600">من تاريخ</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {filters.dateTo || 'غير محدد'}
                </div>
                <div className="text-sm text-gray-600">إلى تاريخ</div>
              </div>
            </div>
            
            <p className="text-blue-700 text-center mt-4">
              يمكنك استخدام الفلاتر أعلاه لتحديد فترة زمنية محددة وتصدير تقرير شامل بجميع البيانات.
            </p>
          </div>

          {/* عرض قائمة المحاضر */}
          <RecordsList
            records={filteredRecords}
            isMyView={isMyReportsView || currentUser?.role === 'inspector'}
            onRecordClick={() => {}}
            onExportToPDF={() => {}}
          />
        </>
      )}
    </div>
  );
};
