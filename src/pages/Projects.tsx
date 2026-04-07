import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Briefcase, Calendar, CheckCircle, Clock, Link as LinkIcon, Paperclip, Printer, Download } from 'lucide-react';
import AttachmentsManager from '../components/AttachmentsManager';
import * as XLSX from 'xlsx';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [linkedDocs, setLinkedDocs] = useState<string[]>([]);
  const userRole = localStorage.getItem('userRole') || 'viewer';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(console.error);
  };

  const openModal = (project: any = null) => {
    setEditingProject(project);
    setAttachments(project?.attachments || []);
    setLinkedDocs(project?.linkedDocs || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Add attachments and linked docs
    const finalData = {
      ...data,
      attachments,
      linkedDocs
    };

    const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
    const method = editingProject ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) throw new Error('فشل حفظ المشروع');
      fetchProjects();
      setIsModalOpen(false);
      setEditingProject(null);
      alert(editingProject ? 'تم تعديل المشروع بنجاح' : 'تم إضافة المشروع بنجاح');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('حدث خطأ أثناء حفظ المشروع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('فشل الحذف');
        fetchProjects();
        alert('تم حذف المشروع بنجاح');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name?.includes(searchTerm) || 
    p.contractor?.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مكتمل': return 'bg-green-100 text-green-800';
      case 'قيد التنفيذ': return 'bg-blue-100 text-blue-800';
      case 'متوقف': return 'bg-red-100 text-red-800';
      case 'قيد الدراسة': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredProjects.map(p => ({
      'اسم المشروع': p.name || '-',
      'الجهة المنفذة': p.contractor || '-',
      'تاريخ البدء': p.startDate || '-',
      'تاريخ الانتهاء': p.endDate || '-',
      'الميزانية': p.budget || '-',
      'الحالة': p.status || '-',
      'نسبة الإنجاز': p.completionPercentage ? `${p.completionPercentage}%` : '-',
      'الوصف': p.description || '-',
      'ملاحظات': p.notes || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المشاريع");
    
    // Auto-size columns
    const colWidths = [
      { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 40 }, { wch: 30 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, "سجل_المشاريع.xlsx");
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html dir="rtl">
        <head>
          <title>تقرير المشاريع</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a3622; padding-bottom: 10px; }
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
            <h1 class="title">تقرير المشاريع</h1>
            <p class="subtitle">تاريخ التقرير: ${new Date().toLocaleDateString('ar-SY')}</p>
          </div>
          
          <div class="summary">
            <div class="summary-box">
              <h3>إجمالي المشاريع</h3>
              <p>${filteredProjects.length}</p>
            </div>
            <div class="summary-box">
              <h3>المشاريع المكتملة</h3>
              <p>${filteredProjects.filter(p => p.status === 'مكتمل').length}</p>
            </div>
            <div class="summary-box">
              <h3>قيد التنفيذ</h3>
              <p>${filteredProjects.filter(p => p.status === 'قيد التنفيذ').length}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>اسم المشروع</th>
                <th>المقاول/المنفذ</th>
                <th>تاريخ البدء</th>
                <th>تاريخ الانتهاء المتوقع</th>
                <th>الميزانية (ل.س)</th>
                <th>نسبة الإنجاز</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProjects.map(p => `
                <tr>
                  <td>${p.name || '-'}</td>
                  <td>${p.contractor || '-'}</td>
                  <td>${p.startDate || '-'}</td>
                  <td>${p.endDate || '-'}</td>
                  <td>${p.budget || '-'}</td>
                  <td dir="ltr" style="text-align: right;">${p.completionPercentage || '0'}%</td>
                  <td>${p.status || '-'}</td>
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

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-[#1a3622]">إدارة المشاريع</h1>
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
              إضافة مشروع
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="بحث عن مشروع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.contractor}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {userRole === 'admin' && (
                  <>
                    <button
                      onClick={() => openModal(project)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span className="text-sm">تاريخ البدء: {project.startDate || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle size={16} />
                <span className="text-sm">تاريخ الانتهاء: {project.endDate || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                <span className="text-sm">التكلفة: {project.budget ? `${project.budget} ل.س` : 'غير محدد'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status || 'غير محدد'}
              </span>
              <span className="text-sm text-gray-500">
                نسبة الإنجاز: {project.completionPercentage || 0}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-[#d4af37] h-2 rounded-full" 
                style={{ width: `${project.completionPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-[#1a3622]">
                {editingProject ? 'تعديل مشروع' : 'إضافة مشروع جديد'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المشروع</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProject?.name}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الجهة المنفذة (المقاول)</label>
                  <input
                    type="text"
                    name="contractor"
                    defaultValue={editingProject?.contractor}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البدء</label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={editingProject?.startDate}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الانتهاء المتوقع</label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={editingProject?.endDate}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الميزانية / التكلفة (ل.س)</label>
                  <input
                    type="number"
                    name="budget"
                    defaultValue={editingProject?.budget}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">حالة المشروع</label>
                  <select
                    name="status"
                    defaultValue={editingProject?.status || 'قيد الدراسة'}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  >
                    <option value="قيد الدراسة">قيد الدراسة</option>
                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                    <option value="مكتمل">مكتمل</option>
                    <option value="متوقف">متوقف</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نسبة الإنجاز (%)</label>
                  <input
                    type="number"
                    name="completionPercentage"
                    min="0"
                    max="100"
                    defaultValue={editingProject?.completionPercentage || 0}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف المشروع وملاحظات</label>
                <textarea
                  name="description"
                  defaultValue={editingProject?.description}
                  rows={4}
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
                  {isSubmitting ? 'جاري الحفظ...' : (editingProject ? 'حفظ التعديلات' : 'إضافة المشروع')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
