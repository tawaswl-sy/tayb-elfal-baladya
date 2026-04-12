import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Plus, Edit, Trash2, Search, Download, Printer, MapPin } from 'lucide-react';
import { exportToExcel, printTable } from '../../utils/exportUtils';
import LocationPicker from '../../components/databank/LocationPicker';

export default function Properties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'أرض زراعية مؤجرة',
    neighborhood_id: '',
    rented: false,
    rent_value: '',
    tenant_name: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, nRes] = await Promise.all([
        fetch('/api/databank/properties'),
        fetch('/api/databank/neighborhoods')
      ]);
      if (!pRes.ok || !nRes.ok) throw new Error('Failed to fetch data');
      setProperties(await pRes.json());
      setNeighborhoods(await nRes.json());
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/databank/properties/${editingId}` : '/api/databank/properties';
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
    if (!confirm('هل أنت متأكد من حذف هذا الملك؟')) return;
    const res = await fetch(`/api/databank/properties/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      type: 'أرض زراعية مؤجرة',
      neighborhood_id: '',
      rented: false,
      rent_value: '',
      tenant_name: '',
      latitude: '',
      longitude: ''
    });
  };

  const filteredProperties = properties.filter(p => p.type.includes(search) || (p.tenant_name && p.tenant_name.includes(search)));

  const handleExportExcel = () => {
    const data = filteredProperties.map(p => ({
      'نوع الملك': p.type,
      'الحي': neighborhoods.find(n => n.id === p.neighborhood_id)?.name || '-',
      'حالة التأجير': p.rented ? 'مؤجر' : 'غير مؤجر',
      'اسم المستأجر': p.tenant_name || '-',
      'قيمة الإيجار': p.rent_value || '-'
    }));
    exportToExcel(data, 'أملاك_البلدية');
  };

  const handlePrint = () => {
    const columns = ['نوع الملك', 'الحي', 'حالة التأجير', 'اسم المستأجر', 'قيمة الإيجار'];
    const data = filteredProperties.map(p => [
      p.type,
      neighborhoods.find(n => n.id === p.neighborhood_id)?.name || '-',
      p.rented ? 'مؤجر' : 'غير مؤجر',
      p.tenant_name || '-',
      p.rent_value || '-'
    ]);
    printTable('قائمة أملاك البلدية', columns, data);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-xl text-[#d4af37]">
            <Map size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">أملاك البلدية</h1>
            <p className="text-gray-500 mt-1">إدارة الأراضي والمحلات والأبنية التابعة للبلدية</p>
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
            إضافة ملك
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="بحث عن ملك أو مستأجر..."
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
                <th className="p-4 font-medium">النوع</th>
                <th className="p-4 font-medium">الحي</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">المستأجر</th>
                <th className="p-4 font-medium">القيمة</th>
                <th className="p-4 font-medium w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{p.type}</td>
                  <td className="p-4 text-gray-600">{neighborhoods.find(n => n.id === p.neighborhood_id)?.name || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${p.rented ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {p.rented ? 'مؤجر' : 'غير مؤجر'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{p.tenant_name || '-'}</td>
                  <td className="p-4 text-gray-600">{p.rent_value ? `${p.rent_value} ل.س` : '-'}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {p.latitude && p.longitude && (
                        <button
                          onClick={() => navigate(`/databank/map?lat=${p.latitude}&lng=${p.longitude}`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="الذهاب إلى الموقع"
                        >
                          <MapPin size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingId(p.id);
                          setFormData(p);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
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
          {filteredProperties.length === 0 && (
            <div className="text-center py-8 text-gray-500">لا توجد أملاك مضافة</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-[#1a3622] mb-6">
              {editingId ? 'تعديل ملك' : 'إضافة ملك جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  >
                    <option value="أرض زراعية مؤجرة">أرض زراعية مؤجرة</option>
                    <option value="أرض فضاء">أرض فضاء</option>
                    <option value="محلات">محلات</option>
                    <option value="أبنية">أبنية</option>
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
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="rented"
                  checked={formData.rented}
                  onChange={e => setFormData({ ...formData, rented: e.target.checked })}
                  className="w-4 h-4 text-[#1a3622] focus:ring-[#1a3622] border-gray-300 rounded"
                />
                <label htmlFor="rented" className="text-sm font-medium text-gray-700">مؤجر؟</label>
              </div>

              {formData.rented && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستأجر</label>
                    <input
                      type="text"
                      required={formData.rented}
                      value={formData.tenant_name}
                      onChange={e => setFormData({ ...formData, tenant_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الإيجار</label>
                    <input
                      type="number"
                      required={formData.rented}
                      min="0"
                      value={formData.rent_value}
                      onChange={e => setFormData({ ...formData, rent_value: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

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
