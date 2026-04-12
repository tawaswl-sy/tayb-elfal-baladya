import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, Plus, Edit, Trash2, Search, Download, Printer, MapPin, 
  LayoutGrid, Map as MapIcon, School, Hospital, Trees, Droplets, 
  Zap, Building2, ShieldCheck, Mail, HelpCircle, Moon
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { exportToExcel, printTable } from '../../utils/exportUtils';
import LocationPicker from '../../components/databank/LocationPicker';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const typeIcons: Record<string, any> = {
  'مسجد': Moon,
  'مدرسة': School,
  'مركز صحي': Hospital,
  'حديقة': Trees,
  'بئر مياه': Droplets,
  'محطة كهرباء': Zap,
  'بلدية': Building2,
  'مخفر شرطة': ShieldCheck,
  'بريد': Mail,
  'أخرى': HelpCircle
};

const typeColors: Record<string, string> = {
  'مسجد': '#3b82f6', // Blue
  'مدرسة': '#10b981', // Green
  'مركز صحي': '#ef4444', // Red
  'حديقة': '#22c55e', // Emerald
  'بئر مياه': '#0ea5e9', // Sky
  'محطة كهرباء': '#f59e0b', // Amber
  'بلدية': '#6366f1', // Indigo
  'مخفر شرطة': '#475569', // Slate
  'بريد': '#ec4899', // Pink
  'أخرى': '#94a3b8'  // Gray
};

const getFacilitySvg = (type: string) => {
  switch (type) {
    case 'مسجد':
      return '<path d="M2 22h20"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M5 18v4"/><path d="M19 18v4"/><path d="M12 6c-3.31 0-6 2.69-6 6v6h12v-6c0-3.31-2.69-6-6-6z"/>';
    case 'مدرسة':
      return '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>';
    case 'مركز صحي':
      return '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>';
    case 'حديقة':
      return '<path d="M10 10v.01"/><path d="M14 10v.01"/><path d="M10 14v.01"/><path d="M14 14v.01"/><circle cx="12" cy="12" r="10"/>';
    case 'بئر مياه':
      return '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>';
    case 'محطة كهرباء':
      return '<path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 L13 2 Z"/>';
    case 'بلدية':
      return '<path d="M2 22h20"/><path d="M7 22v-4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v4"/><path d="M9 17v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5"/><path d="M12 11V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"/><path d="M21 6h-5a2 2 0 0 0-2 2v3"/>';
    case 'مخفر شرطة':
      return '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/>';
    case 'بريد':
      return '<path d="M22 6H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>';
    default:
      return '<circle cx="12" cy="12" r="10"/>';
  }
};

export default function Facilities() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
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
    try {
      const [fRes, nRes] = await Promise.all([
        fetch('/api/databank/facilities'),
        fetch('/api/databank/neighborhoods')
      ]);
      if (!fRes.ok || !nRes.ok) throw new Error('Failed to fetch data');
      setFacilities(await fRes.json());
      setNeighborhoods(await nRes.json());
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
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
          <div className="bg-[#1a3622] p-3 rounded-xl text-[#d4af37]">
            <Building size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">المرافق العامة</h1>
            <p className="text-gray-500 mt-1">إدارة المساجد، المراكز الصحية، الحدائق وغيرها</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 mr-4">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[#1a3622] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              title="عرض الجدول"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-[#1a3622] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              title="عرض الخريطة"
            >
              <MapIcon size={20} />
            </button>
          </div>
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
            إضافة مرفق
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="بحث عن مرفق..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        {viewMode === 'table' ? (
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
                {filteredFacilities.map(f => {
                  const Icon = typeIcons[f.type] || HelpCircle;
                  return (
                    <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-50 text-[#1a3622]">
                            <Icon size={18} />
                          </div>
                          <span className="font-medium text-gray-900">{f.name}</span>
                        </div>
                      </td>
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
                          {f.latitude && f.longitude && (
                            <button
                              onClick={() => navigate(`/databank/map?lat=${f.latitude}&lng=${f.longitude}`)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="الذهاب إلى الموقع"
                            >
                              <MapPin size={18} />
                            </button>
                          )}
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
                  );
                })}
              </tbody>
            </table>
            {filteredFacilities.length === 0 && (
              <div className="text-center py-8 text-gray-500">لا توجد مرافق مضافة</div>
            )}
          </div>
        ) : (
          <div className="h-[600px] rounded-2xl overflow-hidden border border-gray-200 relative z-0">
            <MapContainer 
              center={filteredFacilities.length > 0 && filteredFacilities[0].latitude ? [parseFloat(filteredFacilities[0].latitude), parseFloat(filteredFacilities[0].longitude)] : [35.15, 40.43]} 
              zoom={14} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredFacilities.filter(f => f.latitude && f.longitude).map(f => {
                const Icon = typeIcons[f.type] || HelpCircle;
                // Create a custom div icon for Leaflet
                const customIcon = L.divIcon({
                  html: `<div style="background-color: ${typeColors[f.type] || '#94a3b8'}; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transform: rotate(45deg);">
                          <div style="transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              ${getFacilitySvg(f.type)}
                            </svg>
                          </div>
                        </div>`,
                  className: 'custom-marker',
                  iconSize: [34, 34],
                  iconAnchor: [17, 17]
                });

                return (
                  <Marker 
                    key={f.id} 
                    position={[parseFloat(f.latitude), parseFloat(f.longitude)]}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="text-right p-1" dir="rtl">
                        <div className="flex items-center gap-2 mb-2 border-b pb-1">
                          <Icon size={16} className="text-[#1a3622]" />
                          <h3 className="font-bold text-gray-900">{f.name}</h3>
                        </div>
                        <p className="text-xs text-gray-600 mb-1"><strong>النوع:</strong> {f.type}</p>
                        <p className="text-xs text-gray-600 mb-1"><strong>الحي:</strong> {neighborhoods.find(n => n.id === f.neighborhood_id)?.name || '-'}</p>
                        <p className="text-xs text-gray-600">
                          <strong>الحالة:</strong> 
                          <span className={`mr-1 ${
                            f.condition === 'ممتازة' ? 'text-green-600' :
                            f.condition === 'جيدة' ? 'text-blue-600' :
                            f.condition === 'مقبولة' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {f.condition}
                          </span>
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(f.id);
                              setFormData(f);
                              setIsModalOpen(true);
                            }}
                            className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                          >
                            تعديل
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
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
