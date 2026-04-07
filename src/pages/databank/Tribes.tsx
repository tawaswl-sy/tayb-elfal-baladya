import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Download, Printer } from 'lucide-react';
import { exportToExcel, printTable } from '../../utils/exportUtils';

export default function Tribes() {
  const [tribes, setTribes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchTribes();
  }, []);

  const fetchTribes = async () => {
    const res = await fetch('/api/databank/tribes');
    const data = await res.json();
    setTribes(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/databank/tribes/${editingId}` : '/api/databank/tribes';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      fetchTribes();
      setIsModalOpen(false);
      setFormData({ name: '' });
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العشيرة؟')) return;
    const res = await fetch(`/api/databank/tribes/${id}`, { method: 'DELETE' });
    if (res.ok) fetchTribes();
  };

  const filteredTribes = tribes.filter(t => t.name.includes(search));

  const handleExportExcel = () => {
    const data = filteredTribes.map(t => ({
      'اسم العشيرة': t.name
    }));
    exportToExcel(data, 'العشائر');
  };

  const handlePrint = () => {
    const columns = ['اسم العشيرة'];
    const data = filteredTribes.map(t => [t.name]);
    printTable('قائمة العشائر', columns, data);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-lg text-[#d4af37]">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">إدارة العشائر</h1>
            <p className="text-gray-500 mt-1">إضافة وتعديل العشائر المكونة للمدينة</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Printer size={20} />
            طباعة
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            تصدير Excel
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '' });
              setIsModalOpen(true);
            }}
            className="bg-[#d4af37] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-600 transition-colors"
          >
            <Plus size={20} />
            إضافة عشيرة
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="بحث عن عشيرة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-medium">اسم العشيرة</th>
                <th className="p-4 font-medium w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredTribes.map(tribe => (
                <tr key={tribe.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{tribe.name}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(tribe.id);
                          setFormData({ name: tribe.name });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(tribe.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTribes.length === 0 && (
            <div className="text-center py-8 text-gray-500">لا توجد عشائر مضافة</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#1a3622] mb-6">
              {editingId ? 'تعديل عشيرة' : 'إضافة عشيرة جديدة'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العشيرة</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-[#1a3622] text-white px-4 py-2 rounded-lg hover:bg-[#2a4a32] transition-colors"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
