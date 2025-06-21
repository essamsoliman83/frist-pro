
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Paperclip, File, X, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // base64 content
}

interface AttachmentUploadProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  attachments,
  onAttachmentsChange,
  maxFiles = 5,
  maxSizeInMB = 10
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: FileList) => {
    console.log('AttachmentUpload: Starting file upload process');
    
    if (files.length === 0) return;

    setUploading(true);
    const newAttachments: Attachment[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size
        if (file.size > maxSizeInMB * 1024 * 1024) {
          toast.error(`الملف ${file.name} كبير جداً. الحد الأقصى ${maxSizeInMB} ميجابايت`);
          continue;
        }
        
        // Check max files limit
        if (attachments.length + newAttachments.length >= maxFiles) {
          toast.error(`يمكن رفع ${maxFiles} ملفات كحد أقصى`);
          break;
        }

        // Show progress for current file
        setUploadProgress(prev => ({ ...prev, [file.name]: true }));
        toast.success(`جاري تحميل ${file.name}...`);

        try {
          // Convert to base64
          const base64Content = await convertFileToBase64(file);
          
          const attachment: Attachment = {
            id: Date.now().toString() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            content: base64Content
          };
          
          newAttachments.push(attachment);
          
          // Show success message
          setUploadProgress(prev => ({ ...prev, [file.name]: false }));
          toast.success(`تم تحميل ${file.name} بنجاح ✓`);
          
          console.log('AttachmentUpload: Successfully converted file to base64:', file.name);
          
        } catch (error) {
          console.error('AttachmentUpload: Error converting file:', error);
          setUploadProgress(prev => ({ ...prev, [file.name]: false }));
          toast.error(`خطأ في تحميل ${file.name}`);
        }
      }

      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments]);
        toast.success(`تم تحميل ${newAttachments.length} ملف بنجاح`);
      }
      
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const removeAttachment = (id: string) => {
    const attachment = attachments.find(a => a.id === id);
    if (attachment) {
      onAttachmentsChange(attachments.filter(a => a.id !== id));
      toast.success(`تم حذف ${attachment.name}`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4 font-['Cairo',_'Segoe_UI',_'Tahoma',_sans-serif]">
      <Card 
        className={`border-2 border-dashed transition-all duration-300 rounded-xl overflow-hidden ${
          dragOver ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileSelect(e.dataTransfer.files);
        }}
      >
        <CardContent className="p-8 text-center bg-gradient-to-br from-gray-50 to-white">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
            dragOver || uploading ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {uploading ? (
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            ) : (
              <Upload className={`h-8 w-8 transition-colors duration-300 ${
                dragOver ? 'text-blue-600' : 'text-gray-400'
              }`} />
            )}
          </div>
          
          {uploading ? (
            <p className="text-lg font-bold text-blue-600 mb-2">جاري التحميل...</p>
          ) : (
            <p className="text-lg font-bold text-gray-600 mb-2">اسحب الملفات هنا أو</p>
          )}
          
          <Button 
            type="button"
            variant="outline"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-bold disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                جاري التحميل...
              </>
            ) : (
              <>
                <Paperclip className="ml-2 h-5 w-5" />
                اختر الملفات
              </>
            )}
          </Button>
          
          <p className="text-sm text-gray-500 mt-4 bg-gray-100 rounded-lg p-3 border">
            <span className="font-semibold">أقصى حجم:</span> {maxSizeInMB} ميجابايت | <span className="font-semibold">أقصى عدد:</span> {maxFiles} ملفات
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            accept="image/*,.pdf,.doc,.docx,.txt"
            disabled={uploading}
          />
        </CardContent>
      </Card>

      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="text-blue-700 font-semibold">جاري معالجة الملفات...</span>
          </div>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-3">
          <p className="font-bold text-gray-700 text-lg border-b-2 border-gray-200 pb-2">
            الملفات المرفقة ({attachments.length}/{maxFiles}):
          </p>
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-xl border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-700">{attachment.name}</p>
                    <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block mt-1">
                      {formatFileSize(attachment.size)} • تم التحميل ✓
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
