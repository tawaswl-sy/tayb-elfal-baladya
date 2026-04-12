import React, { useState, useEffect } from 'react';
import { Gavel, Plus, Edit, Trash2, Search, FileText, Calendar, User, Download, Printer } from 'lucide-react';
import { exportToExcel, printTable } from '../utils/exportUtils';

export default function Decisions() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    year: new Date().getFullYear().toString(),
    date: new Date().toISOString().split('T')[0],
    subject: '',
    issuer: 'رئيس المجلس البلدي',
    details: '',
    attachment: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/decisions');
      if (res.ok) setDecisions(await res.json());
    } catch (error) {
      console.error('Error fetching decisions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/decisions/${editingId}` : '/api/decisions';
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
    if (!confirm('هل أنت متأكد من حذف هذا القرار؟')) return;
    const res = await fetch(`/api/decisions/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      number: '',
      year: new Date().getFullYear().toString(),
      date: new Date().toISOString().split('T')[0],
      subject: '',
      issuer: 'رئيس المجلس البلدي',
      details: '',
      attachment: ''
    });
  };

  const filteredDecisions = decisions.filter(d => 
    d.number.includes(search) || 
    d.subject.includes(search) ||
    d.issuer.includes(search)
  ).sort((a, b) => Number(b.number) - Number(a.number));

  const handlePrint = () => {
    const columns = ['رقم القرار', 'التاريخ', 'الموضوع', 'الجهة المصدرة'];
    const data = filteredDecisions.map(d => [
      `${d.number} / ${d.year}`,
      d.date,
      d.subject,
      d.issuer
    ]);
    printTable('سجل القرارات البلدية الرسمية', columns, data);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-xl text-[#d4af37]">
            <Gavel size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">أرشيف القرارات الرسمية</h1>
            <p className="text-gray-500 mt-1">سجل القرارات البلدية الصادرة بأرقام تسلسلية</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all font-bold"
          >
            <Printer size={20} />
            طباعة السجل
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-[#d4af37] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-yellow-600 transition-all shadow-lg font-bold"
          >
            <Plus size={20} />
            إضافة قرار جديد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="بحث برقم القرار أو الموضوع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 font-bold">
            <FileText size={16} />
            <span>إجمالي القرارات: {filteredDecisions.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50/50 text-gray-600 border-b border-gray-100">
              <tr>
                <th className="p-4 font-black text-sm uppercase tracking-wider">رقم القرار</th>
                <th className="p-4 font-black text-sm uppercase tracking-wider">التاريخ</th>
                <th className="p-4 font-black text-sm uppercase tracking-wider">الموضوع</th>
                <th className="p-4 font-black text-sm uppercase tracking-wider">الجهة المصدرة</th>
                <th className="p-4 font-black text-sm uppercase tracking-wider w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDecisions.map(decision => (
                <tr key={decision.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#1a3622] text-[#d4af37] w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs">
                        {decision.number}
                      </span>
                      <span className="text-gray-400 font-bold">/ {decision.year}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Calendar size={14} className="text-blue-500" />
                      {decision.date}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{decision.subject}</p>
                    {decision.details && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{decision.details}</p>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <User size={14} className="text-[#d4af37]" />
                      {decision.issuer}
                    </div>
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(decision.id);
                          setFormData(decision);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(decision.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDecisions.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Gavel size={40} />
              </div>
              <p className="text-gray-400 font-bold italic">لا توجد قرارات مسجلة حالياً</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-[#1a3622] mb-6">
              {editingId ? 'تعديل القرار' : 'إضافة قرار رسمي جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">رقم القرار</label>
                  <input
                    type="number"
                    required
                    value={formData.number}
                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                    placeholder="مثال: 15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">السنة</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">التاريخ</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الموضوع</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  placeholder="موضوع القرار..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الجهة المصدرة</label>
                <input
                  type="text"
                  required
                  value={formData.issuer}
                  onChange={e => setFormData({ ...formData, issuer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">التفاصيل (اختياري)</label>
                <textarea
                  value={formData.details}
                  onChange={e => setFormData({ ...formData, details: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent h-24"
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-[#1a3622] text-white px-4 py-3 rounded-xl hover:bg-[#2a4a32] transition-all font-bold shadow-lg"
                >
                  حفظ القرار
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all font-bold"
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
