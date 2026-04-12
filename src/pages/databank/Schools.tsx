import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Plus, Edit, Trash2, Search, Download, Printer, MapPin } from 'lucide-react';
import { exportToExcel, printTable } from '../../utils/exportUtils';
import LocationPicker from '../../components/databank/LocationPicker';

export default function Schools() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ابتدائي',
    neighborhood_id: '',
    teachers_count: '',
    latitude: '',
    longitude: '',
    students: {
      primary: '',
      middle: '',
      secondary: ''
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, nRes] = await Promise.all([
        fetch('/api/databank/schools'),
        fetch('/api/databank/neighborhoods')
      ]);
      if (!sRes.ok || !nRes.ok) throw new Error('Failed to fetch data');
      setSchools(await sRes.json());
      setNeighborhoods(await nRes.json());
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/databank/schools/${editingId}` : '/api/databank/schools';
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
    if (!confirm('هل أنت متأكد من حذف هذه المدرسة؟')) return;
    const res = await fetch(`/api/databank/schools/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      type: 'ابتدائي',
      neighborhood_id: '',
      teachers_count: '',
      latitude: '',
      longitude: '',
      students: {
        primary: '',
        middle: '',
        secondary: ''
      }
    });
  };

  const filteredSchools = schools.filter(s => s.name.includes(search));

  const handleExportExcel = () => {
    const data = filteredSchools.map(s => ({
      'اسم المدرسة': s.name,
      'النوع': s.type,
      'الحي': neighborhoods.find(n => n.id === s.neighborhood_id)?.name || '-',
      'عدد المدرسين': s.teachers_count,
      'طلاب الابتدائي': s.students?.primary || 0,
      'طلاب الإعدادي': s.students?.middle || 0,
      'طلاب الثانوي': s.students?.secondary || 0,
      'إجمالي الطلاب': (Number(s.students?.primary || 0) + Number(s.students?.middle || 0) + Number(s.students?.secondary || 0))
    }));
    exportToExcel(data, 'المدارس');
  };

  const handlePrint = () => {
    const columns = ['اسم المدرسة', 'النوع', 'الحي', 'عدد المدرسين', 'إجمالي الطلاب'];
    const data = filteredSchools.map(s => [
      s.name,
      s.type,
      neighborhoods.find(n => n.id === s.neighborhood_id)?.name || '-',
      s.teachers_count,
      (Number(s.students?.primary || 0) + Number(s.students?.middle || 0) + Number(s.students?.secondary || 0))
    ]);
    printTable('قائمة المدارس', columns, data);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-xl text-[#d4af37]">
            <School size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">المدارس والتعليم</h1>
            <p className="text-gray-500 mt-1">إدارة المدارس وأعداد الطلاب والمدرسين</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Printer size={20} />
            طباعة
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            تصدير Excel
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-[#d4af37] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-yellow-600 transition-colors"
          >
            <Plus size={20} />
            إضافة مدرسة
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="بحث عن مدرسة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-medium">المدرسة</th>
                <th className="p-4 font-medium">النوع</th>
                <th className="p-4 font-medium">الحي</th>
                <th className="p-4 font-medium">المدرسين</th>
                <th className="p-4 font-medium">الطلاب</th>
                <th className="p-4 font-medium w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map(s => {
                const totalStudents = Number(s.students?.primary || 0) + Number(s.students?.middle || 0) + Number(s.students?.secondary || 0);
                return (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{s.name}</td>
                    <td className="p-4 text-gray-600">{s.type}</td>
                    <td className="p-4 text-gray-600">{neighborhoods.find(n => n.id === s.neighborhood_id)?.name || '-'}</td>
                    <td className="p-4 text-gray-600">{s.teachers_count}</td>
                    <td className="p-4 text-gray-600">{totalStudents}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {s.latitude && s.longitude && (
                          <button
                            onClick={() => navigate(`/databank/map?lat=${s.latitude}&lng=${s.longitude}`)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="الذهاب إلى الموقع"
                          >
                            <MapPin size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingId(s.id);
                            setFormData(s);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredSchools.length === 0 && (
            <div className="text-center py-8 text-gray-500">لا توجد مدارس مضافة</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-[#1a3622] mb-6">
              {editingId ? 'تعديل مدرسة' : 'إضافة مدرسة جديدة'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المدرسة</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  >
                    <option value="ابتدائي">ابتدائي</option>
                    <option value="إعدادي">إعدادي</option>
                    <option value="ثانوي">ثانوي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحي</label>
                  <select
                    required
                    value={formData.neighborhood_id}
                    onChange={e => setFormData({ ...formData, neighborhood_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  >
                    <option value="">اختر الحي...</option>
                    {neighborhoods.map(n => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عدد المدرسين</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.teachers_count}
                    onChange={e => setFormData({ ...formData, teachers_count: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#1a3622] mt-6 mb-4 border-b pb-2">أعداد الطلاب</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ابتدائي</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.students.primary}
                    onChange={e => setFormData({ ...formData, students: { ...formData.students, primary: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">إعدادي</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.students.middle}
                    onChange={e => setFormData({ ...formData, students: { ...formData.students, middle: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ثانوي</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.students.secondary}
                    onChange={e => setFormData({ ...formData, students: { ...formData.students, secondary: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#1a3622] mt-6 mb-4 border-b pb-2">الموقع الجغرافي</h3>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <LocationPicker 
                  lat={formData.latitude} 
                  lng={formData.longitude} 
                  onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                />
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">خط العرض</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.latitude}
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-500"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">خط الطول</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.longitude}
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-500"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-[#1a3622] text-white px-4 py-2 rounded-xl hover:bg-[#2a4a32] transition-colors font-bold shadow-lg"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors font-bold"
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
