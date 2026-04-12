import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Truck, FolderOpen, Activity, LogOut, Menu, 
  Briefcase, MessageSquare, FileSignature, Settings, Database, Server, 
  Code2, Map as MapIcon, CheckSquare, Gavel, Landmark, Bell, FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';
import SystemTray from './SystemTray';
import { SYRIAN_EAGLE_LOGO } from '../lib/logo';

export default function Layout({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const userRole = localStorage.getItem('userRole') || 'employee';

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'الرئيسية', roles: ['admin', 'diwan', 'accountant', 'employee'] },
    { path: '/tasks', icon: CheckSquare, label: 'المهام والمتابعة', roles: ['admin', 'diwan', 'employee'] },
    { path: '/decisions', icon: Gavel, label: 'أرشيف القرارات', roles: ['admin', 'diwan'] },
    { path: '/meetings', icon: FileText, label: 'محاضر الاجتماعات', roles: ['admin', 'diwan'] },
    { path: '/morning-report', icon: Activity, label: 'التقرير الصباحي', roles: ['admin', 'diwan'] },
    { path: '/budget', icon: Landmark, label: 'الميزانية', roles: ['admin', 'accountant'] },
    { path: '/databank', icon: Server, label: 'بنك المعلومات', roles: ['admin'] },
    { path: '/databank/map', icon: MapIcon, label: 'الخريطة التفاعلية', roles: ['admin', 'employee'] },
    { path: '/employees', icon: Users, label: 'الموظفين', roles: ['admin', 'accountant'] },
    { path: '/machinery', icon: Truck, label: 'الآليات', roles: ['admin', 'employee'] },
    { path: '/documents', icon: FolderOpen, label: 'الوثائق', roles: ['admin', 'diwan', 'accountant'] },
    { path: '/projects', icon: Briefcase, label: 'المشاريع', roles: ['admin', 'employee'] },
    { path: '/complaints', icon: MessageSquare, label: 'الشكاوى', roles: ['admin', 'employee'] },
    { path: '/licenses', icon: FileSignature, label: 'الرخص', roles: ['admin', 'employee'] },
    { path: '/users', icon: Users, label: 'المستخدمين', roles: ['admin'] },
    { path: '/activity', icon: Activity, label: 'سجل النشاط', roles: ['admin'] },
    { path: '/backups', icon: Database, label: 'النسخ الاحتياطي', roles: ['admin'] },
    { path: '/settings', icon: Settings, label: 'الإعدادات', roles: ['admin'] },
    { path: '/developer', icon: Code2, label: 'معلومات المطور', roles: ['admin', 'diwan', 'accountant', 'employee'] },
  ].filter(item => item.roles.includes(userRole));

  return (
    <div dir="rtl" className="flex h-screen bg-[#f8fafc] text-gray-900 font-sans relative overflow-hidden">
      {/* Sidebar */}
      <aside className={`relative z-40 transition-all duration-500 ease-in-out ${sidebarOpen ? 'w-72' : 'w-24'} p-4 flex flex-col h-full`}>
        <div className="bg-[#1a3622] text-white rounded-[2.5rem] flex flex-col h-full shadow-2xl shadow-green-900/20 border border-white/5 overflow-hidden relative group/sidebar">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="p-6 flex items-center justify-between relative">
            {sidebarOpen ? (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                  <img src={SYRIAN_EAGLE_LOGO} alt="شعار البلدية" className="w-7 h-7 object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-lg tracking-tight text-[#d4af37]">مدير البلدية</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">نظام الإدارة الذكي</span>
                </div>
              </div>
            ) : (
              <div className="mx-auto bg-white/10 p-2 rounded-2xl border border-white/10">
                <img src={SYRIAN_EAGLE_LOGO} alt="شعار" className="w-6 h-6 object-contain" />
              </div>
            )}
          </div>

          <div className="px-4 mb-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all duration-300 border border-white/5 group"
            >
              <Menu size={18} className={`transition-transform duration-500 ${sidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
          </div>
          
          <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar relative">
            <ul className="space-y-1.5">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`group flex items-center p-3.5 rounded-[1.25rem] transition-all duration-300 relative overflow-hidden ${
                        isActive 
                          ? 'bg-[#d4af37] text-[#1a3622] shadow-lg shadow-[#d4af37]/20 font-bold scale-[1.02]' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
                      )}
                      <div className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[#1a3622]' : 'text-[#d4af37]/80'}`}>
                        <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      {sidebarOpen && (
                        <span className="mr-4 text-sm tracking-wide truncate relative z-10">{item.label}</span>
                      )}
                      {!sidebarOpen && (
                        <div className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 mt-auto relative">
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            <button
              onClick={onLogout}
              className="relative z-10 flex items-center w-full p-4 rounded-[1.25rem] bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all duration-500 group shadow-inner border border-red-500/20"
            >
              <LogOut size={20} className="shrink-0 transition-transform group-hover:-translate-x-1" />
              {sidebarOpen && <span className="mr-3 font-bold text-sm">تسجيل الخروج</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-0">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#1a3622]/5 to-transparent pointer-events-none"></div>
        
        {/* Top Header with Notifications */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-gray-500">
              {navItems.find(item => item.path === location.pathname)?.label || 'البلدية'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <span className="font-bold text-sm">التنبيهات والإشعارات</span>
                    <span className="text-[10px] bg-[#1a3622] text-white px-2 py-0.5 rounded-full">{notifications.length}</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n, i) => (
                        <div key={i} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${n.type === 'danger' ? 'bg-red-50/30' : n.type === 'warning' ? 'bg-yellow-50/30' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'danger' ? 'bg-red-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{n.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-2">{new Date(n.timestamp).toLocaleString('ar-SA')}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400 text-sm">لا توجد تنبيهات حالياً</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 w-[1px] bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900">المستخدم الحالي</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{userRole === 'admin' ? 'مدير النظام' : userRole === 'accountant' ? 'محاسب' : userRole === 'diwan' ? 'ديوان' : 'موظف'}</p>
              </div>
              <div className="w-8 h-8 bg-[#1a3622] rounded-lg flex items-center justify-center text-[#d4af37] font-bold text-xs uppercase">
                {userRole.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>

      {/* System Tray (Admin Only) */}
      {userRole === 'admin' && <SystemTray onLogout={onLogout} />}
    </div>
  );
}
