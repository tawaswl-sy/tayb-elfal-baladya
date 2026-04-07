import React, { useState, useEffect } from 'react';
import { Building, Plus, Edit, Trash2, Search, Download, Printer } from 'lucide-react';
import { exportToExcel, printTable } from '../../utils/exportUtils';

export default function Facilities() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'مسجد',
    neighborhood_id: '',
    condition: 'ممتازة',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [fRes, nRes] = await Promise.all([
      fetch('/api/databank/facilities'),
      fetch('/api/databank/neighborhoods')
    ]);
    setFacilities(await fRes.json());
    setNeighborhoods(await nRes.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/databank/facilities/${editingId}` : '/api/databank/facilities';
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
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المرفق؟')) return;
    const res = await fetch(`/api/databank/facilities/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      type: 'مسجد',
      neighborhood_id: '',
      condition: 'ممتازة',
      latitude: '',
      longitude: ''
    });
  };

  const filteredFacilities = facilities.filter(f => f.name.includes(search));

  const handleExportExcel = () => {
    const data = filteredFacilities.map(f => ({
      'اسم المرفق': f.name,
      'النوع': f.type,
      'الحي': neighborhoods.find(n => n.id === f.neighborhood_id)?.name || '-',
      'الحالة': f.condition
    }));
    exportToExcel(data, 'المرافق_العامة');
  };

  const handlePrint = () => {
    const columns = ['اسم المرفق', 'النوع', 'الحي', 'الحالة'];
    const data = filteredFacilities.map(f => [
      f.name,
      f.type,
      neighborhoods.find(n => n.id === f.neighborhood_id)?.name || '-',
      f.condition
    ]);
    printTable('قائمة المرافق العامة', columns, data);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-lg text-[#d4af37]">
            <Building size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">المرافق العامة</h1>
            <p className="text-gray-500 mt-1">إدارة المساجد، المراكز الصحية، الحدائق وغيرها</p>
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
            إضافة مرفق
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="بحث عن مرفق..."
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
                <th className="p-4 font-medium">اسم المرفق</th>
                <th className="p-4 font-medium">النوع</th>
                <th className="p-4 font-medium">الحي</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacilities.map(f => (
                <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{f.name}</td>
                  <td className="p-4 text-gray-600">{f.type}</td>
                  <td className="p-4 text-gray-600">{neighborhoods.find(n => n.id === f.neighborhood_id)?.name || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      f.condition === 'ممتازة' ? 'bg-green-100 text-green-800' :
                      f.condition === 'جيدة' ? 'bg-blue-100 text-blue-800' :
                      f.condition === 'مقبولة' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {f.condition}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(f.id);
                          setFormData(f);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
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
          {filteredFacilities.length === 0 && (
            <div className="text-center py-8 text-gray-500">لا توجد مرافق مضافة</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#1a3622] mb-6">
              {editingId ? 'تعديل مرفق' : 'إضافة مرفق جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المرفق</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  >
                    <option value="مسجد">مسجد</option>
                    <option value="مدرسة">مدرسة</option>
                    <option value="مركز صحي">مركز صحي</option>
                    <option value="حديقة">حديقة</option>
                    <option value="بئر مياه">بئر مياه</option>
                    <option value="محطة كهرباء">محطة كهرباء</option>
                    <option value="بلدية">بلدية</option>
                    <option value="مخفر شرطة">مخفر شرطة</option>
                    <option value="بريد">بريد</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحي</label>
                  <select
                    required
                    value={formData.neighborhood_id}
                    onChange={e => setFormData({ ...formData, neighborhood_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  >
                    <option value="">اختر الحي...</option>
                    {neighborhoods.map(n => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <select
                    value={formData.condition}
                    onChange={e => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  >
                    <option value="ممتازة">ممتازة</option>
                    <option value="جيدة">جيدة</option>
                    <option value="مقبولة">مقبولة</option>
                    <option value="سيئة">سيئة</option>
                    <option value="خارج الخدمة">خارج الخدمة</option>
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#1a3622] mt-6 mb-4 border-b pb-2">الموقع الجغرافي</h3>
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
