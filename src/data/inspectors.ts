
import { User } from '@/types';

// دالة للحصول على جميع المفتشين من المستخدمين فقط
export const getAllInspectorsFromUsers = (users: User[]): string[] => {
  const inspectorsFromUsers = users
    .filter(user => user.role === 'inspector')
    .map(user => user.name);
  
  return inspectorsFromUsers;
};

// دالة للحصول على المفتشين حسب جهات العمل من المستخدمين (تشمل المدراء والمسؤولين إذا كانت جهات عملهم الإشرافية وجهات عملهم العادية تطابق الجهات المحددة)
export const getInspectorsByWorkplacesFromUsers = (users: User[], workplaces: string[]): string[] => {
  console.log('getInspectorsByWorkplacesFromUsers - Input users:', users.map(u => ({ name: u.name, role: u.role, workPlace: u.workPlace, administrativeWorkPlaces: u.administrativeWorkPlaces })));
  console.log('getInspectorsByWorkplacesFromUsers - Input workplaces:', workplaces);
  
  const result: string[] = [];
  
  users.forEach(user => {
    console.log(`Checking user: ${user.name}, role: ${user.role}`);
    
    // التحقق من المفتشين العاديين
    if (user.role === 'inspector') {
      if (!user.workPlace) {
        console.log(`Excluding inspector ${user.name} because no workPlace`);
        return;
      }
      
      const matches = workplaces.some(workplace => 
        user.workPlace?.toLowerCase().includes(workplace.toLowerCase()) ||
        workplace.toLowerCase().includes(user.workPlace?.toLowerCase() || '')
      );
      
      if (matches) {
        console.log(`Adding inspector ${user.name} - workPlace matches`);
        result.push(user.name);
      } else {
        console.log(`Excluding inspector ${user.name} - workPlace doesn't match`);
      }
    }
    // التحقق من المدراء والمسؤولين
    else if (user.role === 'manager' || user.role === 'supervisor') {
      // التحقق من جهات العمل الإشرافية
      if (user.administrativeWorkPlaces && user.administrativeWorkPlaces.length > 0) {
        const adminMatches = workplaces.some(workplace => 
          user.administrativeWorkPlaces!.some(adminWorkPlace =>
            adminWorkPlace.toLowerCase().includes(workplace.toLowerCase()) ||
            workplace.toLowerCase().includes(adminWorkPlace.toLowerCase())
          )
        );
        
        // التحقق من جهة العمل العادية أيضاً
        const regularWorkPlaceMatches = user.workPlace && workplaces.some(workplace => 
          user.workPlace?.toLowerCase().includes(workplace.toLowerCase()) ||
          workplace.toLowerCase().includes(user.workPlace?.toLowerCase() || '')
        );
        
        // يجب أن تتطابق جهة العمل الإشرافية وجهة العمل العادية كلاهما
        if (adminMatches && regularWorkPlaceMatches) {
          console.log(`Adding ${user.role} ${user.name} as inspector - both administrative and regular workPlace match`);
          result.push(user.name);
        } else {
          console.log(`Excluding ${user.role} ${user.name} - adminMatches: ${adminMatches}, regularMatches: ${regularWorkPlaceMatches}`);
        }
      } else {
        console.log(`Excluding ${user.role} ${user.name} - no administrative workPlaces defined`);
      }
    } else {
      console.log(`Excluding ${user.name} because role is ${user.role}`);
    }
  });
  
  console.log('getInspectorsByWorkplacesFromUsers - Final result:', result);
  return result;
};

// دالة للحصول على المفتشين حسب جهات العمل (من المستخدمين فقط)
export const getInspectorsByWorkplaces = (workplaces: string[]): string[] => {
  // سيتم استخدام البيانات من المستخدمين المسجلين فقط
  return [];
};

// دالة للحصول على جميع المفتشين (من المستخدمين فقط)
export const getAllInspectors = (): string[] => {
  // سيتم استخدام البيانات من المستخدمين المسجلين فقط
  return [];
};
