
export interface ViolationItem {
  id: string;
  title: string;
  description: string;
  attachments?: {
    type: 'image' | 'pdf' | 'document';
    url: string;
    name: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ViolationsBySection {
  humanResources: ViolationItem[];
  documentsAndBooks: ViolationItem[];
  dispensingPolicies: ViolationItem[];
  storageAndHealth: ViolationItem[];
  inventoryManagement: ViolationItem[];
  securityAndSafety: ViolationItem[];
  otherViolations: ViolationItem[];
}

export type ViolationCategory = 
  | 'humanResources'
  | 'documentsAndBooks'
  | 'dispensingPolicies'
  | 'storageAndHealth'
  | 'inventoryManagement'
  | 'securityAndSafety'
  | 'otherViolations';

export const VIOLATION_CATEGORIES: Record<ViolationCategory, string> = {
  humanResources: 'القوة البشرية',
  documentsAndBooks: 'الدفاتر والمستندات',
  dispensingPolicies: 'سياسات الصرف والقوائم',
  storageAndHealth: 'الاشتراطات الصحية والتخزين',
  inventoryManagement: 'إدارة المخزون',
  securityAndSafety: 'الأمن والسلامة',
  otherViolations: 'مخالفات أخرى'
};
