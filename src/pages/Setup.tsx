import { useState } from 'react';
import React from 'react';
import { SYRIAN_EAGLE_LOGO } from '../lib/logo';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

export default function Setup({ onComplete }: { onComplete: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [headerLine1, setHeaderLine1] = useState('الجمهورية العربية السورية');
  const [headerLine2, setHeaderLine2] = useState('محافظة دير الزور - ناحية البصيرة');
  const [headerLine3, setHeaderLine3] = useState('مجلس بلدية طيب الفال');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Additional users state
  const [additionalUsers, setAdditionalUsers] = useState<{username: string, password: string, role: string}[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('viewer');

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

  const handleAddUser = () => {
    if (!newUserName || !newUserPassword) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور للحساب الإضافي');
      return;
    }
    if (additionalUsers.some(u => u.username === newUserName) || newUserName === username) {
      setError('اسم المستخدم موجود مسبقاً');
      return;
    }
    setAdditionalUsers([...additionalUsers, { username: newUserName, password: newUserPassword, role: newUserRole }]);
    setNewUserName('');
    setNewUserPassword('');
    setNewUserRole('viewer');
    setError('');
  };

  const handleRemoveUser = (index: number) => {
    const newUsers = [...additionalUsers];
    newUsers.splice(index, 1);
    setAdditionalUsers(newUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('headerLine1', headerLine1);
    formData.append('headerLine2', headerLine2);
    formData.append('headerLine3', headerLine3);
    formData.append('additionalUsers', JSON.stringify(additionalUsers));
    
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        onComplete();
      } else {
        const data = await res.json();
        setError(data.error || 'فشل الإعداد');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl border-t-4 border-[#d4af37] animate-slide-up">
        <div className="text-center mb-8">
          <img src={previewLogo || SYRIAN_EAGLE_LOGO} alt="شعار البلدية" className="w-24 h-24 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-[#1a3622] mb-2">إعداد النظام</h1>
          <p className="text-gray-500">تهيئة النظام لأول مرة وإعداد الحسابات</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Settings Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-[#1a3622] mb-4 border-b pb-2">إعدادات البلدية والترويسة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">السطر الأول (مثال: الجمهورية العربية السورية)</label>
                <input
                  type="text"
                  value={headerLine1}
                  onChange={(e) => setHeaderLine1(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السطر الثاني (مثال: محافظة دير الزور - ناحية البصيرة)</label>
                <input
                  type="text"
                  value={headerLine2}
                  onChange={(e) => setHeaderLine2(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السطر الثالث (مثال: مجلس بلدية طيب الفال)</label>
                <input
                  type="text"
                  value={headerLine3}
                  onChange={(e) => setHeaderLine3(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">شعار البلدية (اختياري)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                    {previewLogo ? (
                      <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="text-gray-400" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] text-sm bg-white" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Account Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-[#1a3622] mb-4 border-b pb-2">حساب مدير النظام (Admin)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Accounts Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-[#1a3622] mb-4 border-b pb-2">حسابات إضافية (اختياري)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصلاحية</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622]"
                >
                  <option value="viewer">قراءة فقط (Viewer)</option>
                  <option value="diwan">الديوان (Diwan)</option>
                  <option value="admin">مدير (Admin)</option>
                </select>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAddUser}
                  className="w-full bg-[#1a3622] text-white p-2 rounded-lg hover:bg-[#2a4a32] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  إضافة
                </button>
              </div>
            </div>

            {additionalUsers.length > 0 && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">اسم المستخدم</th>
                      <th className="p-2">الصلاحية</th>
                      <th className="p-2 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {additionalUsers.map((user, index) => (
                      <tr key={index} className="border-t bg-white">
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'diwan' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role === 'admin' ? 'مدير' : user.role === 'diwan' ? 'الديوان' : 'قراءة فقط'}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveUser(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#d4af37] text-white p-4 rounded-lg hover:bg-yellow-600 transition-colors font-bold text-lg disabled:opacity-50"
          >
            {isSubmitting ? 'جاري إعداد النظام...' : 'إكمال الإعداد والبدء'}
          </button>
        </form>
      </div>
    </div>
  );
}
