import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, FileText, Calendar, CheckCircle, Clock, FileSignature, User, Printer, Download } from 'lucide-react';
import AttachmentsManager from '../components/AttachmentsManager';
import * as XLSX from 'xlsx';

export default function Licenses() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLicense, setEditingLicense] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [linkedDocs, setLinkedDocs] = useState<string[]>([]);
  const userRole = localStorage.getItem('userRole') || 'viewer';

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = () => {
    fetch('/api/licenses')
      .then(res => res.json())
      .then(data => setLicenses(data))
      .catch(console.error);
  };

  const openModal = (license: any = null) => {
    setEditingLicense(license);
    setAttachments(license?.attachments || []);
    setLinkedDocs(license?.linkedDocs || []);
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

    const url = editingLicense ? `/api/licenses/${editingLicense.id}` : '/api/licenses';
    const method = editingLicense ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) throw new Error('فشل حفظ الرخصة');
      fetchLicenses();
      setIsModalOpen(false);
      setEditingLicense(null);
      alert(editingLicense ? 'تم تعديل الرخصة بنجاح' : 'تم إضافة الرخصة بنجاح');
    } catch (error) {
      console.error('Error saving license:', error);
      alert('حدث خطأ أثناء حفظ الرخصة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الرخصة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        const response = await fetch(`/api/licenses/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('فشل الحذف');
        fetchLicenses();
        alert('تم حذف الرخصة بنجاح');
      } catch (error) {
        console.error('Error deleting license:', error);
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const filteredLicenses = licenses.filter(l => 
    l.citizenName?.includes(searchTerm) || 
    l.licenseType?.includes(searchTerm) ||
    l.licenseNumber?.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'سارية المفعول': return 'bg-green-100 text-green-800';
      case 'منتهية': return 'bg-red-100 text-red-800';
      case 'قيد الإصدار': return 'bg-yellow-100 text-yellow-800';
      case 'موقوفة': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredLicenses.map(l => ({
      'رقم الرخصة': l.licenseNumber || '-',
      'نوع الرخصة': l.licenseType || '-',
      'اسم صاحب الرخصة': l.citizenName || '-',
      'الرقم الوطني': l.nationalId || '-',
      'تاريخ الإصدار': l.issueDate || '-',
      'تاريخ الانتهاء': l.expiryDate || '-',
      'الرسوم المستوفاة': l.fees || 0,
      'حالة الرخصة': l.status || 'قيد الإصدار',
      'ملاحظات': l.notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الرخص");
    
    // Set RTL direction for the worksheet
    if (!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ rightToLeft: true });

    XLSX.writeFile(workbook, "سجل_الرخص.xlsx");
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html dir="rtl">
        <head>
          <title>تقرير الرخص</title>
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
            <h1 class="title">تقرير الرخص</h1>
            <p class="subtitle">تاريخ التقرير: ${new Date().toLocaleDateString('ar-SY')}</p>
          </div>
          
          <div class="summary">
            <div class="summary-box">
              <h3>إجمالي الرخص</h3>
              <p>${filteredLicenses.length}</p>
            </div>
            <div class="summary-box">
              <h3>سارية المفعول</h3>
              <p>${filteredLicenses.filter(l => l.status === 'سارية المفعول').length}</p>
            </div>
            <div class="summary-box">
              <h3>منتهية</h3>
              <p>${filteredLicenses.filter(l => l.status === 'منتهية').length}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>رقم الرخصة</th>
                <th>النوع</th>
                <th>صاحب الرخصة</th>
                <th>تاريخ الإصدار</th>
                <th>تاريخ الانتهاء</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLicenses.map(l => `
                <tr>
                  <td>${l.licenseNumber || '-'}</td>
                  <td>${l.licenseType || '-'}</td>
                  <td>${l.citizenName || '-'}</td>
                  <td>${l.issueDate || '-'}</td>
                  <td>${l.expiryDate || '-'}</td>
                  <td>${l.status || '-'}</td>
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

  const printLicense = (license: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>طباعة رخصة - ${license.licenseNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
          body {
            font-family: 'Tajawal', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fff;
          }
          .certificate {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0 auto;
            box-sizing: border-box;
            position: relative;
            background: white;
          }
          .border-pattern {
            position: absolute;
            top: 10mm;
            left: 10mm;
            right: 10mm;
            bottom: 10mm;
            border: 4px double #d4af37;
            padding: 5mm;
            pointer-events: none;
          }
          .inner-border {
            width: 100%;
            height: 100%;
            border: 1px solid #1a3622;
            box-sizing: border-box;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            width: 60%;
            pointer-events: none;
            z-index: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
          }
          .logo {
            width: 100px;
            height: 100px;
            margin-bottom: 15px;
          }
          .republic {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 5px 0;
          }
          .ministry {
            font-size: 16px;
            margin: 0 0 5px 0;
          }
          .municipality {
            font-size: 20px;
            font-weight: bold;
            color: #1a3622;
            margin: 0 0 20px 0;
          }
          .title {
            font-size: 32px;
            font-weight: 800;
            color: #d4af37;
            text-align: center;
            margin: 30px 0;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }
          .content {
            position: relative;
            z-index: 1;
            line-height: 2;
            font-size: 18px;
            padding: 0 20px;
          }
          .field {
            margin-bottom: 15px;
            display: flex;
            align-items: baseline;
          }
          .label {
            font-weight: bold;
            color: #1a3622;
            width: 150px;
            flex-shrink: 0;
          }
          .value {
            font-weight: bold;
            border-bottom: 1px dotted #ccc;
            flex-grow: 1;
            padding: 0 10px;
          }
          .notes-section {
            margin-top: 30px;
            padding: 15px;
            border: 1px solid #eee;
            background-color: #fafafa;
            border-radius: 8px;
          }
          .notes-title {
            font-weight: bold;
            color: #1a3622;
            margin-bottom: 10px;
          }
          .footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            position: relative;
            z-index: 1;
            padding: 0 20px;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-title {
            font-weight: bold;
            margin-bottom: 40px;
            color: #1a3622;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 40px;
          }
          @media print {
            body { background-color: white; }
            .certificate { margin: 0; padding: 20mm; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="border-pattern">
            <div class="inner-border"></div>
          </div>
          
          <img src="/logo.png" class="watermark" alt="Watermark" onerror="this.style.display='none'" />
          
          <div class="header">
            <img src="/logo.png" class="logo" alt="شعار البلدية" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWEzNjIyIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzFhMzYyMiI+2LTYudin2LE8L3RleHQ+PC9zdmc+'" />
            <p class="republic">الجمهورية العربية السورية</p>
            <p class="ministry">وزارة الإدارة المحلية والبيئة</p>
            <p class="municipality">بلدية طيب الفال</p>
          </div>

          <div class="title">${license.licenseType}</div>

          <div class="content">
            <div class="field">
              <span class="label">رقم الرخصة:</span>
              <span class="value">${license.licenseNumber}</span>
            </div>
            <div class="field">
              <span class="label">اسم صاحب الرخصة:</span>
              <span class="value">${license.citizenName}</span>
            </div>
            <div class="field">
              <span class="label">الرقم الوطني / الهوية:</span>
              <span class="value">${license.nationalId || '---'}</span>
            </div>
            <div class="field">
              <span class="label">تاريخ الإصدار:</span>
              <span class="value">${license.issueDate || '---'}</span>
            </div>
            <div class="field">
              <span class="label">تاريخ الانتهاء:</span>
              <span class="value">${license.expiryDate || '---'}</span>
            </div>
            <div class="field">
              <span class="label">الرسوم المستوفاة:</span>
              <span class="value">${license.fees || 0} ل.س</span>
            </div>
            
            ${license.notes ? `
            <div class="notes-section">
              <div class="notes-title">ملاحظات وشروط:</div>
              <div>${license.notes.replace(/\\n/g, '<br>')}</div>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <div class="signature-box">
              <div class="signature-title">المدقق</div>
              <div class="signature-line"></div>
            </div>
            <div class="signature-box">
              <div class="signature-title">رئيس البلدية</div>
              <div class="signature-line"></div>
            </div>
          </div>
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          };
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
        <h1 className="text-3xl font-bold text-[#1a3622]">إدارة الرخص</h1>
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
              إصدار رخصة جديدة
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="بحث برقم الرخصة، الاسم، أو النوع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLicenses.map((license) => (
          <div key={license.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileSignature size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{license.licenseType}</h3>
                  <p className="text-sm text-gray-500 font-mono mt-1">رقم: {license.licenseNumber}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => printLicense(license)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="طباعة الشهادة"
                >
                  <Printer size={18} />
                </button>
                {userRole === 'admin' && (
                  <>
                    <button
                      onClick={() => openModal(license)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(license.id)}
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
                <span>صاحب الرخصة: {license.citizenName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>تاريخ الإصدار: {license.issueDate || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span>تاريخ الانتهاء: {license.expiryDate || 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                <span>المرفقات: {(license.attachments?.length || 0) + (license.linkedDocs?.length || 0)} ملف</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(license.status)}`}>
                {license.status || 'قيد الإصدار'}
              </span>
              <span className="text-sm font-bold text-gray-700">
                الرسوم: {license.fees || 0} ل.س
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-[#1a3622]">
                {editingLicense ? 'تعديل بيانات الرخصة' : 'إصدار رخصة جديدة'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الرخصة</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    defaultValue={editingLicense?.licenseNumber}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع الرخصة</label>
                  <select
                    name="licenseType"
                    defaultValue={editingLicense?.licenseType || 'رخصة بناء'}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  >
                    <option value="رخصة بناء">رخصة بناء</option>
                    <option value="رخصة مزاولة مهنة">رخصة مزاولة مهنة</option>
                    <option value="رخصة إشغال طريق">رخصة إشغال طريق</option>
                    <option value="رخصة هدم">رخصة هدم</option>
                    <option value="رخصة حفر">رخصة حفر</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم صاحب الرخصة</label>
                  <input
                    type="text"
                    name="citizenName"
                    defaultValue={editingLicense?.citizenName}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الرقم الوطني / الهوية</label>
                  <input
                    type="text"
                    name="nationalId"
                    defaultValue={editingLicense?.nationalId}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الإصدار</label>
                  <input
                    type="date"
                    name="issueDate"
                    defaultValue={editingLicense?.issueDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    name="expiryDate"
                    defaultValue={editingLicense?.expiryDate}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الرسوم (ل.س)</label>
                  <input
                    type="number"
                    name="fees"
                    defaultValue={editingLicense?.fees || 0}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">حالة الرخصة</label>
                  <select
                    name="status"
                    defaultValue={editingLicense?.status || 'قيد الإصدار'}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  >
                    <option value="قيد الإصدار">قيد الإصدار</option>
                    <option value="سارية المفعول">سارية المفعول</option>
                    <option value="منتهية">منتهية</option>
                    <option value="موقوفة">موقوفة</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات وشروط إضافية</label>
                <textarea
                  name="notes"
                  defaultValue={editingLicense?.notes}
                  rows={3}
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
                  {isSubmitting ? 'جاري الحفظ...' : (editingLicense ? 'حفظ التعديلات' : 'إصدار الرخصة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
