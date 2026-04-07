import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, FolderOpen, Activity, LogOut, Menu, Briefcase, MessageSquare, FileSignature, Settings, Database, Server, Code2 } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import SystemTray from './SystemTray';

import { SYRIAN_EAGLE_LOGO } from '../lib/logo';

export default function Layout({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const userRole = localStorage.getItem('userRole') || 'viewer';

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'الرئيسية', roles: ['admin', 'diwan', 'viewer'] },
    { path: '/databank', icon: Server, label: 'بنك المعلومات', roles: ['admin'] },
    { path: '/employees', icon: Users, label: 'الموظفين', roles: ['admin', 'viewer'] },
    { path: '/machinery', icon: Truck, label: 'الآليات', roles: ['admin', 'viewer'] },
    { path: '/documents', icon: FolderOpen, label: 'الوثائق', roles: ['admin', 'diwan', 'viewer'] },
    { path: '/projects', icon: Briefcase, label: 'المشاريع', roles: ['admin', 'viewer'] },
    { path: '/complaints', icon: MessageSquare, label: 'الشكاوى', roles: ['admin', 'viewer'] },
    { path: '/licenses', icon: FileSignature, label: 'الرخص', roles: ['admin', 'viewer'] },
    { path: '/users', icon: Users, label: 'المستخدمين', roles: ['admin'] },
    { path: '/activity', icon: Activity, label: 'سجل النشاط', roles: ['admin'] },
    { path: '/backups', icon: Database, label: 'النسخ الاحتياطي', roles: ['admin'] },
    { path: '/settings', icon: Settings, label: 'الإعدادات', roles: ['admin'] },
    { path: '/developer', icon: Code2, label: 'معلومات المطور', roles: ['admin', 'diwan', 'viewer'] },
  ].filter(item => item.roles.includes(userRole));

  return (
    <div dir="rtl" className="flex h-screen bg-gray-50 text-gray-900 font-sans relative">
      {/* Sidebar */}
      <aside className={`bg-[#1a3622] text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-[#2a4a32]">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img src={SYRIAN_EAGLE_LOGO} alt="شعار البلدية" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg text-[#d4af37]">مدير البلدية</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded hover:bg-[#2a4a32]">
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive ? 'bg-[#2a4a32] text-[#d4af37]' : 'hover:bg-[#2a4a32]'
                    }`}
                  >
                    <item.icon size={20} className="shrink-0" />
                    {sidebarOpen && <span className="mr-3">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#2a4a32]">
          <button
            onClick={onLogout}
            className="flex items-center w-full p-3 rounded-lg hover:bg-red-900/50 text-red-200 transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && <span className="mr-3">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* System Tray (Admin Only) */}
      {userRole === 'admin' && <SystemTray onLogout={onLogout} />}
    </div>
  );
}
