import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, MessageSquare, User, MapPin, Phone, Calendar, FileText, Download, Printer } from 'lucide-react';
import AttachmentsManager from '../components/AttachmentsManager';
import * as XLSX from 'xlsx';

import { SYRIAN_EAGLE_LOGO } from '../lib/logo';

export default function Complaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [linkedDocs, setLinkedDocs] = useState<string[]>([]);
  const userRole = localStorage.getItem('userRole') || 'viewer';

  useEffect(() => {
    fetchComplaints();
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
      })
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const fetchComplaints = () => {
    fetch('/api/complaints')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch complaints');
        return res.json();
      })
      .then(data => setComplaints(data))
      .catch(err => console.error('Error fetching complaints:', err));
  };

  const openModal = (complaint: any = null) => {
    setEditingComplaint(complaint);
    setAttachments(complaint?.attachments || []);
    setLinkedDocs(complaint?.linkedDocs || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const finalData = {
      ...data,
      attachments,
      linkedDocs
    };

    const url = editingComplaint ? `/api/complaints/${editingComplaint.id}` : '/api/complaints';
    const method = editingComplaint ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) throw new Error('فشل حفظ الشكوى');
      fetchComplaints();
      setIsModalOpen(false);
      setEditingComplaint(null);
      alert(editingComplaint ? 'تم تعديل الشكوى بنجاح' : 'تم إضافة الشكوى بنجاح');
    } catch (error) {
      console.error('Error saving complaint:', error);
      alert('حدث خطأ أثناء حفظ الشكوى');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الشكوى؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        const response = await fetch(`/api/complaints/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('فشل الحذف');
        fetchComplaints();
        alert('تم حذف الشكوى بنجاح');
      } catch (error) {
        console.error('Error deleting complaint:', error);
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.citizenName?.includes(searchTerm) || 
    c.subject?.includes(searchTerm) ||
    c.location?.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديدة': return 'bg-red-100 text-red-800';
      case 'قيد المعالجة': return 'bg-yellow-100 text-yellow-800';
      case 'تمت المعالجة': return 'bg-green-100 text-green-800';
      case 'مرفوضة': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html dir="rtl">
        <head>
          <title>تقرير الشكاوى</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a3622; padding-bottom: 10px; }
            .logo { width: 80px; height: 80px; margin-bottom: 10px; object-fit: contain; }
            .title { color: #1a3622; font-size: 24px; font-weight: bold; margin: 0; }
            .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
            th { background-color: #1a3622; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin-top: 20px; display: flex; gap: 20px; justify-content: space-between; }
            .summary-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; flex: 1; text-align: center; }
            .summary-box h3 { margin: 0 0 10px 0; color: #1a3622; font-size: 16px; }
            .summary-box p { margin: 0; font-size: 24px; font-weight: bold; color: #d4af37; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${settings?.logoPath || SYRIAN_EAGLE_LOGO}" class="logo" alt="شعار البلدية" />
            <p class="subtitle">${settings?.headerLine1 || 'الجمهورية العربية السورية'}<br/>${settings?.headerLine2 || 'محافظة دير الزور - ناحية البصيرة'}<br/>${settings?.headerLine3 || 'مجلس بلدية طيب الفال'}</p>
            <h1 class="title">تقرير الشكاوى</h1>
            <p class="subtitle">تاريخ التقرير: ${new Date().toLocaleDateString('ar-SY')}</p>
          </div>
          
          <div class="summary">
            <div class="summary-box">
              <h3>إجمالي الشكاوى</h3>
              <p>${filteredComplaints.length}</p>
            </div>
            <div class="summary-box">
              <h3>الشكاوى الجديدة</h3>
              <p>${filteredComplaints.filter(c => c.status === 'جديدة').length}</p>
            </div>
            <div class="summary-box">
              <h3>تمت المعالجة</h3>
              <p>${filteredComplaints.filter(c => c.status === 'تمت المعالجة').length}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>تاريخ الشكوى</th>
                <th>اسم المشتكي</th>
                <th>الموضوع</th>
                <th>الموقع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredComplaints.map(c => `
                <tr>
                  <td>${c.date || '-'}</td>
                  <td>${c.citizenName || '-'}</td>
                  <td>${c.subject || '-'}</td>
                  <td>${c.location || '-'}</td>
                  <td>${c.status || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const exportToExcel = () => {
    const dataToExport = filteredComplaints.map(c => ({
      'اسم المواطن': c.citizenName || '-',
      'رقم الهاتف': c.phone || '-',
      'موضوع الشكوى': c.subject || '-',
      'الموقع/العنوان': c.location || '-',
      'تاريخ الشكوى': c.date || '-',
      'حالة الشكوى': c.status || 'جديدة',
      'تفاصيل الشكوى': c.details || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الشكاوى");
    
    // Set RTL direction for the worksheet
    if (!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ rightToLeft: true });

    XLSX.writeFile(workbook, "سجل_الشكاوى.xlsx");
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-[#1a3622]">شكاوى المواطنين</h1>
        <div className="flex gap-3">
          <button
            onClick={printReport}
            className="bg-white text-[#1a3622] border border-[#1a3622] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Printer size={20} />
            طباعة تقرير
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            تصدير Excel
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => openModal()}
              className="bg-[#d4af37] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#c4a030] transition-colors"
            >
              <Plus size={20} />
              إضافة شكوى
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="بحث في الشكاوى..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplaints.map((complaint) => (
          <div key={complaint.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{complaint.subject}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status || 'جديدة'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {userRole === 'admin' && (
                  <>
                    <button
                      onClick={() => openModal(complaint)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(complaint.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span>المواطن: {complaint.citizenName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span dir="ltr">{complaint.phone || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>الموقع: {complaint.location || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>تاريخ الشكوى: {complaint.date || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                <span>المرفقات: {(complaint.attachments?.length || 0) + (complaint.linkedDocs?.length || 0)} ملف</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-700 line-clamp-3">
                {complaint.details}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-[#1a3622]">
                {editingComplaint ? 'تعديل شكوى' : 'إضافة شكوى جديدة'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المواطن</label>
                  <input
                    type="text"
                    name="citizenName"
                    defaultValue={editingComplaint?.citizenName}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingComplaint?.phone}
                    dir="ltr"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-right"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">موضوع الشكوى</label>
                  <input
                    type="text"
                    name="subject"
                    defaultValue={editingComplaint?.subject}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموقع / العنوان</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingComplaint?.location}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الشكوى</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={editingComplaint?.date || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">حالة الشكوى</label>
                  <select
                    name="status"
                    defaultValue={editingComplaint?.status || 'جديدة'}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  >
                    <option value="جديدة">جديدة</option>
                    <option value="قيد المعالجة">قيد المعالجة</option>
                    <option value="تمت المعالجة">تمت المعالجة</option>
                    <option value="مرفوضة">مرفوضة</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تفاصيل الشكوى</label>
                <textarea
                  name="details"
                  defaultValue={editingComplaint?.details}
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                ></textarea>
              </div>

              <AttachmentsManager
                attachments={attachments}
                setAttachments={setAttachments}
                linkedDocs={linkedDocs}
                setLinkedDocs={setLinkedDocs}
              />

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1a3622] text-white rounded-lg hover:bg-[#2a4a32] transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'جاري الحفظ...' : (editingComplaint ? 'حفظ التعديلات' : 'إضافة الشكوى')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
