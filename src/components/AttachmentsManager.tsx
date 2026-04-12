import React, { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, X, File, Image as ImageIcon, FileText, Eye } from 'lucide-react';
import FileViewer from './FileViewer';

interface AttachmentsManagerProps {
  attachments: any[];
  setAttachments: (attachments: any[]) => void;
  linkedDocs: string[];
  setLinkedDocs: (docs: string[]) => void;
}

export default function AttachmentsManager({ attachments, setAttachments, linkedDocs, setLinkedDocs }: AttachmentsManagerProps) {
  const [allDocuments, setAllDocuments] = useState<any[]>([]);
  const [showDocSelector, setShowDocSelector] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => setAllDocuments(data))
      .catch(console.error);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setAttachments([...attachments, data]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const toggleLinkedDoc = (docId: string) => {
    if (linkedDocs.includes(docId)) {
      setLinkedDocs(linkedDocs.filter(id => id !== docId));
    } else {
      setLinkedDocs([...linkedDocs, docId]);
    }
  };

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['txt', 'csv'].includes(ext || '')) return 'text';
    if (['doc', 'docx'].includes(ext || '')) return 'word';
    if (['xls', 'xlsx'].includes(ext || '')) return 'excel';
    return 'other';
  };

  const getFileIcon = (filename: string) => {
    const type = getFileType(filename);
    if (type === 'image') return <ImageIcon size={16} className="text-blue-500" />;
    if (type === 'pdf') return <FileText size={16} className="text-red-500" />;
    return <File size={16} className="text-gray-500" />;
  };

  return (
    <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-700">المرفقات والوثائق المرتبطة</h3>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="attachment-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="attachment-upload"
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                isUploading ? 'bg-gray-300 text-gray-500' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <Upload size={16} />
              {isUploading ? 'جاري الرفع...' : 'رفع ملف'}
            </label>
          </div>
          <button
            type="button"
            onClick={() => setShowDocSelector(!showDocSelector)}
            className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg flex items-center gap-2 hover:bg-green-100 transition-colors"
          >
            <LinkIcon size={16} />
            ربط وثيقة
          </button>
        </div>
      </div>

      {showDocSelector && (
        <div className="p-3 bg-white border border-gray-200 rounded-lg mb-4 max-h-48 overflow-y-auto">
          <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">اختر الوثائق للربط (من الصادر/الوارد)</h4>
          {allDocuments.length === 0 ? (
            <p className="text-sm text-gray-500">لا توجد وثائق متاحة.</p>
          ) : (
            <div className="space-y-2">
              {allDocuments.map(doc => (
                <label key={doc.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkedDocs.includes(doc.id)}
                    onChange={() => toggleLinkedDoc(doc.id)}
                    className="rounded text-[#1a3622] focus:ring-[#1a3622]"
                  />
                  {getFileIcon(doc.name)}
                  <span className="text-sm text-gray-700 truncate flex-1">{doc.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{doc.folder || 'بدون مجلد'}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {attachments.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">الملفات المرفوعة</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {getFileIcon(file.name)}
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewFile({ url: file.url, name: file.name, type: getFileType(file.name) })}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="معاينة"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="حذف"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {linkedDocs.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">الوثائق المرتبطة</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {linkedDocs.map(docId => {
                const doc = allDocuments.find(d => d.id === docId);
                if (!doc) return null;
                return (
                  <div key={docId} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {getFileIcon(doc.name)}
                      <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewFile({ url: doc.path, name: doc.name, type: getFileType(doc.originalName || doc.name) })}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="معاينة"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleLinkedDoc(docId)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="إزالة الربط"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {attachments.length === 0 && linkedDocs.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">لا توجد مرفقات أو وثائق مرتبطة</p>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg truncate pr-8">{previewFile.name}</h3>
              <button type="button" onClick={() => setPreviewFile(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-gray-50 overflow-auto flex items-center justify-center p-4 relative">
              <FileViewer 
                url={previewFile.url} 
                type={previewFile.type} 
                name={previewFile.name} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
