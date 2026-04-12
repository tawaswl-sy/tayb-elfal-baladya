import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Search, Users, Calendar, Printer, Download, CheckCircle2 } from 'lucide-react';
import { printTable } from '../utils/exportUtils';

export default function Meetings() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    location: 'قاعة الاجتماعات الكبرى',
    attendees: '',
    agenda: '',
    decisions: '',
    status: 'مسودة'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/meetings');
      if (res.ok) setMeetings(await res.json());
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/meetings/${editingId}` : '/api/meetings';
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
    if (!confirm('هل أنت متأكد من حذف هذا المحضر؟')) return;
    const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      location: 'قاعة الاجتماعات الكبرى',
      attendees: '',
      agenda: '',
      decisions: '',
      status: 'مسودة'
    });
  };

  const filteredMeetings = meetings.filter(m => 
    m.title.includes(search) || 
    m.attendees.includes(search)
  );

  const handlePrint = (meeting: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>محضر اجتماع - ${meeting.title}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-weight: bold; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; border-right: 4px solid #1a3622; padding-right: 10px; margin-bottom: 10px; }
            .content { padding-right: 15px; white-space: pre-wrap; }
            .signatures { margin-top: 50px; display: grid; grid-template-cols: 1fr 1fr; gap: 40px; }
            .sig-box { border-top: 1px solid #000; padding-top: 10px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">محضر اجتماع رسمي</div>
            <div>${meeting.title}</div>
          </div>
          <div class="meta">
            <div>التاريخ: ${meeting.date}</div>
            <div>المكان: ${meeting.location}</div>
          </div>
          <div class="section">
            <div class="section-title">الحاضرون:</div>
            <div class="content">${meeting.attendees}</div>
          </div>
          <div class="section">
            <div class="section-title">جدول الأعمال:</div>
            <div class="content">${meeting.agenda}</div>
          </div>
          <div class="section">
            <div class="section-title">القرارات والتوصيات:</div>
            <div class="content">${meeting.decisions}</div>
          </div>
          <div class="signatures">
            <div class="sig-box">توقيع أمين السر</div>
            <div class="sig-box">توقيع رئيس الجلسة</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-xl text-[#d4af37]">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">محاضر الاجتماعات</h1>
            <p className="text-gray-500 mt-1">توثيق الجلسات والقرارات المتخذة</p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-[#d4af37] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-yellow-600 transition-all shadow-lg font-bold"
        >
          <Plus size={20} />
          إنشاء محضر جديد
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
        <div className="relative max-w-md mb-8">
          <input
            type="text"
            placeholder="بحث في المحاضر..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMeetings.map(meeting => (
            <div key={meeting.id} className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-8 group hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{meeting.title}</h3>
                    <p className="text-sm text-gray-400 font-bold">{meeting.date}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePrint(meeting)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                    title="طباعة المحضر"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(meeting.id);
                      setFormData(meeting);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(meeting.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Users size={16} className="text-[#d4af37]" />
                  <span className="font-bold">الحاضرون:</span>
                  <span className="truncate">{meeting.attendees}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="font-bold">القرارات:</span>
                  <span className="truncate">{meeting.decisions}</span>
                </div>
              </div>

              <button
                onClick={() => handlePrint(meeting)}
                className="w-full mt-6 bg-white border border-gray-200 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                تصدير PDF للطباعة
              </button>
            </div>
          ))}
        </div>

        {filteredMeetings.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <FileText size={40} />
            </div>
            <p className="text-gray-400 font-bold italic">لا توجد محاضر اجتماعات مسجلة</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[#1a3622] mb-6">
              {editingId ? 'تعديل محضر الاجتماع' : 'إنشاء محضر اجتماع جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">عنوان الاجتماع</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                    placeholder="مثال: اجتماع المجلس الأسبوعي"
                  />
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
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">المكان</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الحاضرون</label>
                <textarea
                  required
                  value={formData.attendees}
                  onChange={e => setFormData({ ...formData, attendees: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent h-20"
                  placeholder="أسماء الحاضرين..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">جدول الأعمال</label>
                <textarea
                  required
                  value={formData.agenda}
                  onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">القرارات والتوصيات</label>
                <textarea
                  required
                  value={formData.decisions}
                  onChange={e => setFormData({ ...formData, decisions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent h-32"
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-[#1a3622] text-white px-4 py-3 rounded-xl hover:bg-[#2a4a32] transition-all font-bold shadow-lg"
                >
                  حفظ المحضر
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
