import React, { useState, useEffect } from 'react';
import { Home, Plus, Edit, Trash2, Search, MapPin, Download, Printer } from 'lucide-react';
import { exportToExcel, printTable } from '../../utils/exportUtils';

export default function Neighborhoods() {
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [tribes, setTribes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    population: '',
    families_count: '',
    tribe_id: '',
    ethnic: 'عربي',
    latitude: '',
    longitude: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [nRes, tRes] = await Promise.all([
      fetch('/api/databank/neighborhoods'),
      fetch('/api/databank/tribes')
    ]);
    setNeighborhoods(await nRes.json());
    setTribes(await tRes.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/databank/neighborhoods/${editingId}` : '/api/databank/neighborhoods';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      fetchData();
      setIsModalOpen(false);
      resetForm();
    } else {
      const data = await res.json();
      alert(data.error || 'حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحي؟')) return;
    const res = await fetch(`/api/databank/neighborhoods/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      population: '',
      families_count: '',
      tribe_id: '',
      ethnic: 'عربي',
      latitude: '',
      longitude: '',
      notes: ''
    });
  };

  const filteredNeighborhoods = neighborhoods.filter(n => n.name.includes(search));

  const handleExportExcel = () => {
    const data = filteredNeighborhoods.map(n => ({
      'اسم الحي': n.name,
      'عدد السكان': n.population,
      'عدد العائلات': n.families_count,
      'العشيرة الغالبة': tribes.find(t => t.id === n.tribe_id)?.name || '-',
      'التوزع الإثني': n.ethnic,
      'ملاحظات': n.notes
    }));
    exportToExcel(data, 'الأحياء');
  };

  const handlePrint = () => {
    const columns = ['اسم الحي', 'عدد السكان', 'عدد العائلات', 'العشيرة الغالبة', 'التوزع الإثني', 'ملاحظات'];
    const data = filteredNeighborhoods.map(n => [
      n.name,
      n.population,
      n.families_count,
      tribes.find(t => t.id === n.tribe_id)?.name || '-',
      n.ethnic,
      n.notes
    ]);
    printTable('قائمة الأحياء', columns, data);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-lg text-[#d4af37]">
            <Home size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">إدارة الأحياء</h1>
            <p className="text-gray-500 mt-1">إضافة وتعديل أحياء المدينة وتوزيعها</p>
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
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-[#d4af37] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-600 transition-colors"
          >
            <Plus size={20} />
            إضافة حي
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="بحث عن حي..."
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
                <th className="p-4 font-medium">اسم الحي</th>
                <th className="p-4 font-medium">عدد السكان</th>
                <th className="p-4 font-medium">عدد العائلات</th>
                <th className="p-4 font-medium">العشيرة الغالبة</th>
                <th className="p-4 font-medium">التوزع الإثني</th>
                <th className="p-4 font-medium w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredNeighborhoods.map(n => (
                <tr key={n.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{n.name}</td>
                  <td className="p-4 text-gray-600">{n.population}</td>
                  <td className="p-4 text-gray-600">{n.families_count}</td>
                  <td className="p-4 text-gray-600">{tribes.find(t => t.id === n.tribe_id)?.name || '-'}</td>
                  <td className="p-4 text-gray-600">{n.ethnic}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(n.id);
                          setFormData(n);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
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
          {filteredNeighborhoods.length === 0 && (
            <div className="text-center py-8 text-gray-500">لا توجد أحياء مضافة</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#1a3622] mb-6">
              {editingId ? 'تعديل حي' : 'إضافة حي جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم الحي</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عدد السكان</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.population}
                    onChange={e => setFormData({ ...formData, population: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عدد العائلات</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.families_count}
                    onChange={e => setFormData({ ...formData, families_count: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العشيرة</label>
                  <select
                    required
                    value={formData.tribe_id}
                    onChange={e => setFormData({ ...formData, tribe_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  >
                    <option value="">اختر العشيرة...</option>
                    {tribes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التوزع الإثني</label>
                  <select
                    value={formData.ethnic}
                    onChange={e => setFormData({ ...formData, ethnic: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  >
                    <option value="عربي">عربي</option>
                    <option value="كردي">كردي</option>
                    <option value="تركماني">تركماني</option>
                    <option value="غير ذلك">غير ذلك</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">خط العرض (Latitude)</label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">خط الطول (Longitude)</label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  rows={3}
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
