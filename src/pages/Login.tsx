import { useState } from 'react';
import React from 'react';
import { SYRIAN_EAGLE_LOGO } from '../lib/logo';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('username', data.user.username);
        onLogin();
      } else {
        setError(data.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-100 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-[#1a3622] animate-slide-up">
        <div className="text-center mb-8">
          <img src={SYRIAN_EAGLE_LOGO} alt="شعار البلدية" className="w-24 h-24 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-[#1a3622] mb-2">مدير البلدية</h1>
          <p className="text-gray-500">تسجيل الدخول للنظام</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#1a3622] text-white p-3 rounded-lg hover:bg-[#2a4a32] transition-colors font-bold"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}
