
// دالة التحقق من صحة البيانات الأساسية
export const validateBasicData = (basicData: any): string[] => {
  const errors = [];

  if (!basicData.day?.trim()) {
    errors.push('اليوم');
  }
  if (!basicData.date?.trim()) {
    errors.push('التاريخ');
  }
  if (!basicData.time?.trim()) {
    errors.push('الوقت');
  }
  if (!Array.isArray(basicData.inspectorName) || basicData.inspectorName.length === 0 || basicData.inspectorName.every((name: string) => !name?.trim())) {
    errors.push('اسم المفتش');
  }
  if (!Array.isArray(basicData.workPlace) || basicData.workPlace.length === 0 || basicData.workPlace.every((place: string) => !place?.trim())) {
    errors.push('جهة العمل');
  }
  if (!basicData.institutionName?.trim()) {
    errors.push('اسم المؤسسة');
  }
  if (!basicData.inspectionLocation?.trim()) {
    errors.push('مكان التفتيش');
  }
  if (!basicData.presentPharmacist?.trim()) {
    errors.push('اسم الصيدلي المتواجد');
  }
  if (!basicData.inspectionReason?.trim()) {
    errors.push('سبب التفتيش');
  }

  return errors;
};
