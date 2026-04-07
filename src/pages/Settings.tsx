import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Download, Clock, Calendar, Database } from 'lucide-react';
import { SYRIAN_EAGLE_LOGO } from '../lib/logo';

export default function Settings() {
  const [settings, setSettings] = useState({
    headerLine1: '',
    headerLine2: '',
    headerLine3: '',
    logoPath: ''
  });
  const [backupSettings, setBackupSettings] = useState({
    enabled: false,
    schedule: 'daily',
    time: '00:00'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBackup, setIsSavingBackup] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [backupMessage, setBackupMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSettings();
    fetchBackupSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
      if (data.logoPath) {
        setPreviewLogo(data.logoPath);
      } else {
        setPreviewLogo(SYRIAN_EAGLE_LOGO);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchBackupSettings = async () => {
    try {
      const res = await fetch('/api/backup/settings');
      if (res.ok) {
        const data = await res.json();
        setBackupSettings(data);
      }
    } catch (error) {
      console.error('Error fetching backup settings:', error);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('headerLine1', settings.headerLine1);
    formData.append('headerLine2', settings.headerLine2);
    formData.append('headerLine3', settings.headerLine3);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setMessage({ text: 'تم حفظ الإعدادات بنجاح', type: 'success' });
      } else {
        setMessage({ text: 'حدث خطأ أثناء حفظ الإعدادات', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'حدث خطأ في الاتصال بالخادم', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBackup(true);
    setBackupMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/backup/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupSettings)
      });
      
      if (res.ok) {
        setBackupMessage({ text: 'تم حفظ إعدادات النسخ الاحتياطي بنجاح', type: 'success' });
      } else {
        setBackupMessage({ text: 'حدث خطأ أثناء حفظ الإعدادات', type: 'error' });
      }
    } catch (error) {
      setBackupMessage({ text: 'حدث خطأ في الاتصال بالخادم', type: 'error' });
    } finally {
      setIsSavingBackup(false);
      setTimeout(() => setBackupMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleManualBackup = async () => {
    setIsCreatingBackup(true);
    setBackupMessage({ text: 'جاري إنشاء النسخة الاحتياطية...', type: 'info' });
    try {
      const res = await fetch('/api/backup/manual', { method: 'POST' });
      if (res.ok) {
        setBackupMessage({ text: 'تم إنشاء النسخة الاحتياطية بنجاح', type: 'success' });
      } else {
        setBackupMessage({ text: 'حدث خطأ أثناء إنشاء النسخة الاحتياطية', type: 'error' });
      }
    } catch (error) {
      setBackupMessage({ text: 'حدث خطأ في الاتصال بالخادم', type: 'error' });
    } finally {
      setIsCreatingBackup(false);
      setTimeout(() => setBackupMessage({ text: '', type: '' }), 3000);
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-[#1a3622] mb-8 animate-slide-up">إعدادات النظام</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <h2 className="text-xl font-bold text-[#1a3622] mb-6 border-b pb-2">تخصيص الترويسة والشعار</h2>
          
          {message.text && (
            <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السطر الأول (مثال: الجمهورية العربية السورية)</label>
              <input 
                type="text" 
                value={settings.headerLine1} 
                onChange={e => setSettings({...settings, headerLine1: e.target.value})} 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السطر الثاني (مثال: محافظة دير الزور - ناحية البصيرة)</label>
              <input 
                type="text" 
                value={settings.headerLine2} 
                onChange={e => setSettings({...settings, headerLine2: e.target.value})} 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السطر الثالث (مثال: مجلس بلدية طيب الفال)</label>
              <input 
                type="text" 
                value={settings.headerLine3} 
                onChange={e => setSettings({...settings, headerLine3: e.target.value})} 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شعار البلدية</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {previewLogo ? (
                    <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="text-gray-400" size={32} />
                  )}
                </div>
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622] text-sm" 
                  />
                  <p className="text-xs text-gray-500 mt-2">يفضل استخدام صورة بخلفية شفافة (PNG) وبأبعاد متساوية.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-[#1a3622] text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#2a4a32] transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="bg-gray-50 rounded-xl shadow-inner border border-gray-200 p-6 flex flex-col items-center animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <h2 className="text-lg font-bold text-gray-700 mb-8 w-full text-right border-b pb-2">معاينة الترويسة في الطباعة</h2>
          
          <div className="bg-white p-8 shadow-sm border border-gray-100 w-full max-w-md text-center rounded">
            <img 
              src={previewLogo || SYRIAN_EAGLE_LOGO} 
              alt="شعار البلدية" 
              className="w-20 h-20 mx-auto mb-4 object-contain" 
            />
            <div className="space-y-1">
              <p className="text-gray-900 font-bold text-lg">{settings.headerLine1 || 'السطر الأول'}</p>
              <p className="text-gray-700 font-medium">{settings.headerLine2 || 'السطر الثاني'}</p>
              <p className="text-[#1a3622] font-bold text-xl mt-2">{settings.headerLine3 || 'السطر الثالث'}</p>
            </div>
            
            <div className="mt-8 pt-8 border-t-2 border-[#1a3622] border-dashed">
              <h1 className="text-2xl font-bold text-[#1a3622]">عنوان المستند</h1>
              <p className="text-gray-500 mt-4">محتوى المستند سيظهر هنا...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
        <div className="flex items-center gap-3 mb-6 border-b pb-2">
          <Database className="text-[#1a3622]" size={24} />
          <h2 className="text-xl font-bold text-[#1a3622]">إعدادات النسخ الاحتياطي</h2>
        </div>
        
        {backupMessage.text && (
          <div className={`p-4 mb-6 rounded-lg ${backupMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : backupMessage.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {backupMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleBackupSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="enableBackup"
                checked={backupSettings.enabled}
                onChange={e => setBackupSettings({...backupSettings, enabled: e.target.checked})}
                className="w-5 h-5 text-[#1a3622] rounded focus:ring-[#1a3622]"
              />
              <label htmlFor="enableBackup" className="font-medium text-gray-700">تفعيل النسخ الاحتياطي التلقائي المجدول</label>
            </div>

            {backupSettings.enabled && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar size={16} />
                    تكرار النسخ الاحتياطي
                  </label>
                  <select
                    value={backupSettings.schedule}
                    onChange={e => setBackupSettings({...backupSettings, schedule: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]"
                  >
                    <option value="daily">يومياً</option>
                    <option value="weekly">أسبوعياً (كل يوم أحد)</option>
                    <option value="monthly">شهرياً (أول يوم من كل شهر)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Clock size={16} />
                    وقت النسخ الاحتياطي
                  </label>
                  <input
                    type="time"
                    value={backupSettings.time}
                    onChange={e => setBackupSettings({...backupSettings, time: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={isSavingBackup}
                className="w-full bg-[#1a3622] text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#2a4a32] transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {isSavingBackup ? 'جاري الحفظ...' : 'حفظ إعدادات النسخ الاحتياطي'}
              </button>
            </div>
          </form>

          <div className="flex flex-col justify-center items-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <Database className="text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-bold text-gray-700 mb-2">نسخ احتياطي يدوي</h3>
            <p className="text-gray-500 text-center mb-6 text-sm">
              قم بإنشاء نسخة احتياطية فورية لجميع بيانات النظام وحفظها على الخادم. يمكنك لاحقاً تنزيلها من قسم إدارة النسخ الاحتياطية.
            </p>
            <button
              onClick={handleManualBackup}
              disabled={isCreatingBackup}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download size={20} />
              {isCreatingBackup ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية الآن'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
