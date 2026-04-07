import React, { useState, useEffect } from 'react';
import { Download, Trash2, Upload, Database, RefreshCw, AlertCircle } from 'lucide-react';

interface BackupFile {
  name: string;
  size: number;
  createdAt: string;
}

export default function Backups() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/backup/list');
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) return;

    try {
      const res = await fetch(`/api/backup/${filename}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBackups();
        setMessage({ text: 'تم حذف النسخة الاحتياطية بنجاح', type: 'success' });
      } else {
        setMessage({ text: 'حدث خطأ أثناء الحذف', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'حدث خطأ في الاتصال بالخادم', type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFile) return;

    if (!window.confirm('تحذير: استعادة النسخة الاحتياطية ستقوم بمسح جميع البيانات الحالية واستبدالها. هل أنت متأكد؟')) return;

    setIsRestoring(true);
    setMessage({ text: 'جاري استعادة النسخة الاحتياطية... يرجى الانتظار', type: 'info' });

    const formData = new FormData();
    formData.append('backup', restoreFile);

    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setMessage({ text: 'تم استعادة النسخة الاحتياطية بنجاح. سيتم إعادة تحميل الصفحة...', type: 'success' });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage({ text: 'حدث خطأ أثناء الاستعادة', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'حدث خطأ في الاتصال بالخادم', type: 'error' });
    } finally {
      setIsRestoring(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1a3622] animate-slide-up">إدارة النسخ الاحتياطية</h1>
        <button 
          onClick={fetchBackups}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={20} />
          تحديث القائمة
        </button>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : message.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Backup List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Database className="text-[#1a3622]" size={24} />
            <h2 className="text-xl font-bold text-[#1a3622]">النسخ الاحتياطية المحفوظة</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4 font-semibold">اسم الملف</th>
                  <th className="p-4 font-semibold">تاريخ الإنشاء</th>
                  <th className="p-4 font-semibold">الحجم</th>
                  <th className="p-4 font-semibold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">جاري التحميل...</td>
                  </tr>
                ) : backups.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">لا توجد نسخ احتياطية محفوظة</td>
                  </tr>
                ) : (
                  backups.map((backup) => (
                    <tr key={backup.name} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-800 font-medium" dir="ltr">{backup.name}</td>
                      <td className="p-4 text-gray-600">{new Date(backup.createdAt).toLocaleString('ar-SA')}</td>
                      <td className="p-4 text-gray-600" dir="ltr">{formatSize(backup.size)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <a 
                            href={`/api/backup/download/${backup.name}`}
                            download
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="تنزيل"
                          >
                            <Download size={20} />
                          </a>
                          <button 
                            onClick={() => handleDelete(backup.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Restore Backup */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className="flex items-center gap-3 mb-6 border-b pb-2">
            <Upload className="text-[#1a3622]" size={24} />
            <h2 className="text-xl font-bold text-[#1a3622]">استعادة نسخة احتياطية</h2>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3 text-yellow-800">
            <AlertCircle className="shrink-0 mt-1" size={20} />
            <p className="text-sm leading-relaxed">
              <strong>تحذير:</strong> استعادة النسخة الاحتياطية ستقوم بحذف جميع البيانات الحالية في النظام واستبدالها ببيانات النسخة المرفوعة.
            </p>
          </div>

          <form onSubmit={handleRestore} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اختر ملف النسخة الاحتياطية (.zip)</label>
              <input 
                type="file" 
                accept=".zip"
                onChange={(e) => setRestoreFile(e.target.files ? e.target.files[0] : null)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622] text-sm" 
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isRestoring || !restoreFile}
              className="w-full bg-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Upload size={20} />
              {isRestoring ? 'جاري الاستعادة...' : 'استعادة البيانات'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
