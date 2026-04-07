import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, User } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'viewer' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      setShowModal(false);
      setFormData({ username: '', password: '', role: 'viewer' });
      fetchUsers();
    } else {
      const data = await res.json();
      setError(data.error || 'فشل إضافة المستخدم');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      await fetch(`/api/users/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchUsers();
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-[#1a3622]">إدارة المستخدمين</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#1a3622] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a4a32] transition-colors"
        >
          <Plus size={20} />
          إضافة مستخدم
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600">اسم المستخدم</th>
              <th className="p-4 font-semibold text-gray-600">الصلاحية</th>
              <th className="p-4 font-semibold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 flex items-center gap-2">
                  <User size={18} className="text-gray-400" />
                  {user.username}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'diwan' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'admin' ? 'مدير النظام' : user.role === 'diwan' ? 'الديوان' : 'قراءة فقط'}
                  </span>
                </td>
                <td className="p-4">
                  {user.role !== 'admin' && (
                    <button onClick={() => handleDelete(user.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-slide-up">
            <h2 className="text-xl font-bold mb-4">إضافة مستخدم جديد</h2>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصلاحية</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="viewer">قراءة فقط (Viewer)</option>
                  <option value="diwan">الديوان (Diwan)</option>
                  <option value="admin">مدير النظام (Admin)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-[#1a3622] text-white rounded-lg">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
