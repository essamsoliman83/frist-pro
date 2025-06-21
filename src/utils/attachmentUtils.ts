
import { toast } from 'sonner';

export interface AttachmentData {
  name: string;
  content: string;
  type?: string;
  size?: number;
}

/**
 * الحصول على جميع مرفقات محضر معين - محسن للعمل مع طرق تخزين متعددة
 */
export const getRecordAttachments = (recordId: string): AttachmentData[] => {
  if (!recordId) {
    console.log('AttachmentUtils: No record ID provided');
    return [];
  }
  
  console.log('AttachmentUtils: Getting attachments for record:', recordId);
  
  // طريقة 1: البحث في localStorage بالمفتاح المنفصل
  const attachmentsKey = `attachments_${recordId}`;
  console.log('AttachmentUtils: Looking for attachments with key:', attachmentsKey);
  
  try {
    const storedAttachments = localStorage.getItem(attachmentsKey);
    if (storedAttachments && storedAttachments !== 'null' && storedAttachments !== 'undefined') {
      console.log('AttachmentUtils: Found attachments in separate key:', storedAttachments);
      const parsedAttachments = JSON.parse(storedAttachments);
      if (Array.isArray(parsedAttachments) && parsedAttachments.length > 0) {
        const validAttachments = parsedAttachments.filter(isValidAttachment);
        console.log('AttachmentUtils: Valid attachments from separate key:', validAttachments.length);
        return validAttachments;
      }
    }
  } catch (error) {
    console.error('AttachmentUtils: Error parsing separate attachments:', error);
  }

  // طريقة 2: البحث في بيانات المحضر نفسه
  try {
    const allRecords = localStorage.getItem('pharmacy_inspection_records');
    if (allRecords) {
      const records = JSON.parse(allRecords);
      const record = records.find((r: any) => r.id === recordId);
      
      if (record) {
        console.log('AttachmentUtils: Found record, checking for embedded attachments');
        
        // البحث في جميع أقسام التفتيش عن مرفقات
        const allAttachments: AttachmentData[] = [];
        
        if (record.inspectionResults) {
          // البحث في الأقسام العادية
          const sections = ['humanResources', 'documentsAndBooks', 'dispensingPolicies', 
                          'storageAndHealth', 'securityAndSafety', 'otherViolations'];
          
          sections.forEach(section => {
            const sectionData = record.inspectionResults[section];
            if (Array.isArray(sectionData)) {
              sectionData.forEach((item: any) => {
                if (item.attachments && Array.isArray(item.attachments)) {
                  item.attachments.forEach((att: any) => {
                    if (isValidAttachment(att)) {
                      allAttachments.push(att);
                    }
                  });
                }
              });
            }
          });
          
          // البحث في قسم إدارة المخزون
          const inventory = record.inspectionResults.inventoryManagement;
          if (inventory) {
            const inventorySections = ['shortages', 'stagnant', 'expired'];
            inventorySections.forEach(section => {
              const sectionData = inventory[section];
              if (Array.isArray(sectionData)) {
                sectionData.forEach((item: any) => {
                  if (item.attachments && Array.isArray(item.attachments)) {
                    item.attachments.forEach((att: any) => {
                      if (isValidAttachment(att)) {
                        allAttachments.push(att);
                      }
                    });
                  }
                });
              }
            });
          }
        }
        
        console.log('AttachmentUtils: Found embedded attachments:', allAttachments.length);
        if (allAttachments.length > 0) {
          // حفظ المرفقات في المفتاح المنفصل للوصول السريع لاحقاً
          localStorage.setItem(attachmentsKey, JSON.stringify(allAttachments));
          return allAttachments;
        }
      }
    }
  } catch (error) {
    console.error('AttachmentUtils: Error searching in record data:', error);
  }

  // طريقة 3: البحث بجميع المفاتيح الممكنة
  try {
    const alternativeKeys = [
      `record_${recordId}_attachments`,
      `record_attachments_${recordId}`,
      `attachments-${recordId}`,
      `${recordId}_attachments`
    ];
    
    for (const key of alternativeKeys) {
      const stored = localStorage.getItem(key);
      if (stored && stored !== 'null' && stored !== 'undefined') {
        console.log('AttachmentUtils: Found attachments with alternative key:', key);
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validAttachments = parsed.filter(isValidAttachment);
          if (validAttachments.length > 0) {
            console.log('AttachmentUtils: Valid attachments from alternative key:', validAttachments.length);
            return validAttachments;
          }
        }
      }
    }
  } catch (error) {
    console.error('AttachmentUtils: Error searching alternative keys:', error);
  }
  
  console.log('AttachmentUtils: No attachments found anywhere for record:', recordId);
  return [];
};

/**
 * التحقق من صحة المرفق
 */
const isValidAttachment = (attachment: any): attachment is AttachmentData => {
  const isValid = attachment && 
                 typeof attachment.name === 'string' && 
                 attachment.name.trim() !== '' &&
                 typeof attachment.content === 'string' && 
                 attachment.content.trim() !== '';
  
  if (!isValid) {
    console.log('AttachmentUtils: Invalid attachment found:', attachment);
  }
  
  return isValid;
};

/**
 * التحقق من وجود مرفقات لمحضر معين
 */
export const hasAttachments = (recordId: string): boolean => {
  const attachments = getRecordAttachments(recordId);
  const result = attachments.length > 0;
  console.log(`AttachmentUtils: Record ${recordId} has attachments:`, result, `(${attachments.length} attachments)`);
  return result;
};

/**
 * تحميل مرفق واحد
 */
export const downloadAttachment = (attachment: AttachmentData): boolean => {
  console.log('AttachmentUtils: Starting download for:', attachment.name);
  
  if (!attachment || !attachment.name || !attachment.content) {
    console.error('AttachmentUtils: Invalid attachment data:', attachment);
    toast.error('بيانات المرفق غير صحيحة');
    return false;
  }
  
  try {
    let downloadContent = attachment.content;
    
    // التأكد من تنسيق data URL الصحيح
    if (!downloadContent.startsWith('data:')) {
      const extension = attachment.name.split('.').pop()?.toLowerCase() || '';
      let mimeType = 'application/octet-stream';
      
      // تحديد نوع الملف بناءً على الامتداد
      const mimeTypes: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt': 'text/plain',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
      
      mimeType = mimeTypes[extension] || mimeType;
      downloadContent = `data:${mimeType};base64,${downloadContent}`;
    }
    
    console.log('AttachmentUtils: Download content format:', downloadContent.substring(0, 50) + '...');
    
    // إنشاء رابط التحميل
    const link = document.createElement('a');
    link.href = downloadContent;
    link.download = attachment.name;
    link.style.display = 'none';
    
    // إضافة الرابط للصفحة والنقر عليه
    document.body.appendChild(link);
    link.click();
    
    // تنظيف الرابط بعد فترة قصيرة
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 100);
    
    toast.success(`تم تحميل ${attachment.name} بنجاح ✓`);
    console.log('AttachmentUtils: Download completed successfully');
    return true;
    
  } catch (error) {
    console.error('AttachmentUtils: Download error:', error);
    toast.error(`خطأ في تحميل ${attachment.name}`);
    return false;
  }
};

/**
 * تحميل جميع مرفقات محضر معين
 */
export const downloadAllAttachments = (recordId: string): void => {
  console.log('AttachmentUtils: Starting bulk download for record:', recordId);
  
  const attachments = getRecordAttachments(recordId);
  
  if (attachments.length === 0) {
    toast.error('لا توجد مرفقات لهذا المحضر');
    return;
  }
  
  if (attachments.length === 1) {
    // إذا كان هناك مرفق واحد فقط، حمله مباشرة
    downloadAttachment(attachments[0]);
  } else {
    // إذا كان هناك عدة مرفقات، حمل الكل مع تأخير
    toast.success(`جاري تحميل ${attachments.length} مرفق...`);
    
    attachments.forEach((attachment, index) => {
      setTimeout(() => {
        downloadAttachment(attachment);
      }, index * 500); // تأخير 500ms بين كل تحميل
    });
    
    // رسالة تأكيد بعد انتهاء جميع التحميلات
    setTimeout(() => {
      toast.success('تم الانتهاء من تحميل جميع المرفقات');
    }, attachments.length * 500 + 1000);
  }
};

/**
 * الحصول على عدد المرفقات لمحضر معين
 */
export const getAttachmentsCount = (recordId: string): number => {
  const attachments = getRecordAttachments(recordId);
  console.log(`AttachmentUtils: Attachments count for record ${recordId}:`, attachments.length);
  return attachments.length;
};

/**
 * إنشاء مؤشر مرئي للمرفقات - محسن مع معلومات إضافية
 */
export const createAttachmentIndicator = (recordId: string) => {
  const count = getAttachmentsCount(recordId);
  
  console.log(`AttachmentUtils: Creating indicator for record ${recordId}, count: ${count}`);
  
  if (count === 0) {
    return null;
  }
  
  return {
    count,
    hasAttachments: true,
    label: `${count} مرفق${count > 1 ? 'ات' : ''}`,
    shortLabel: `${count}`
  };
};

/**
 * إعادة فهرسة المرفقات - دالة مساعدة لإصلاح البيانات
 */
export const reindexAttachments = (): void => {
  console.log('AttachmentUtils: Starting reindexing process...');
  
  try {
    const allRecords = localStorage.getItem('pharmacy_inspection_records');
    if (!allRecords) {
      console.log('AttachmentUtils: No records found for reindexing');
      return;
    }
    
    const records = JSON.parse(allRecords);
    let totalAttachments = 0;
    
    records.forEach((record: any) => {
      if (record.id) {
        const attachments = getRecordAttachments(record.id);
        if (attachments.length > 0) {
          const attachmentsKey = `attachments_${record.id}`;
          localStorage.setItem(attachmentsKey, JSON.stringify(attachments));
          totalAttachments += attachments.length;
          console.log(`AttachmentUtils: Reindexed ${attachments.length} attachments for record ${record.id}`);
        }
      }
    });
    
    console.log(`AttachmentUtils: Reindexing completed. Total attachments: ${totalAttachments}`);
    toast.success(`تم إعادة فهرسة ${totalAttachments} مرفق`);
    
  } catch (error) {
    console.error('AttachmentUtils: Error during reindexing:', error);
    toast.error('خطأ في إعادة فهرسة المرفقات');
  }
};
