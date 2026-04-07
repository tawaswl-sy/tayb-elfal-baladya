import React, { useState, useRef, useEffect } from 'react';
import { Settings, FolderOpen, Users, Truck, Power, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SystemTray({ onLogout }: { onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenFolder = async (target: string) => {
    try {
      await fetch('/api/system/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  };

  const handleRestart = async () => {
    if (window.confirm('هل أنت متأكد من إعادة تشغيل الخادم؟')) {
      try {
        await fetch('/api/system/restart', { method: 'POST' });
        alert('جاري إعادة التشغيل... يرجى تحديث الصفحة بعد قليل.');
        setIsOpen(false);
      } catch (error) {
        console.error('Error restarting:', error);
      }
    }
  };

  const handleShutdown = async () => {
    if (window.confirm('هل أنت متأكد من إغلاق التطبيق (الخادم)؟ ستحتاج إلى تشغيله يدوياً مرة أخرى.')) {
      try {
        await fetch('/api/system/shutdown', { method: 'POST' });
        alert('تم إرسال أمر الإغلاق.');
        setIsOpen(false);
      } catch (error) {
        console.error('Error shutting down:', error);
      }
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="fixed bottom-6 left-6 z-50" ref={menuRef}>
      {isOpen && (
        <div className="absolute bottom-16 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 w-64 overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-[#1a3622] text-sm">أدوات النظام (الخادم المحلي)</h3>
          </div>
          <div className="p-2 space-y-1">
            <button onClick={() => handleOpenFolder('data')} className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
              <FolderOpen size={16} className="text-blue-600" />
              فتح مجلد بيانات التطبيق
            </button>
            <button onClick={() => handleOpenFolder('employees')} className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
              <Users size={16} className="text-green-600" />
              فتح مجلد صور الموظفين
            </button>
            <button onClick={() => handleOpenFolder('machinery')} className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
              <Truck size={16} className="text-orange-600" />
              فتح مجلد صور الآليات
            </button>
            <div className="h-px bg-gray-200 my-2"></div>
            <button onClick={handleRestart} className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
              <RefreshCw size={16} className="text-purple-600" />
              إعادة تشغيل الخادم
            </button>
            <button onClick={handleShutdown} className="w-full flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg text-sm text-red-600 transition-colors">
              <Power size={16} />
              إغلاق التطبيق (الخادم)
            </button>
            <div className="h-px bg-gray-200 my-2"></div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors">
              <LogOut size={16} className="text-gray-600" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-xl transition-all duration-300 ${isOpen ? 'bg-[#2a4a32] text-[#d4af37]' : 'bg-[#1a3622] text-white hover:bg-[#2a4a32]'}`}
        title="أدوات النظام"
      >
        <Settings size={24} className={isOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
      </button>
    </div>
  );
}
