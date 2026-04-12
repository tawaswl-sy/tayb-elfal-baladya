import { useState, useEffect } from 'react';
import React from 'react';
import { Plus, Search, Edit, Trash2, Printer, IdCard, Download } from 'lucide-react';
import { SYRIAN_EAGLE_LOGO } from '../lib/logo';
import * as XLSX from 'xlsx';

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    headerLine1: 'الجمهورية العربية السورية',
    headerLine2: 'محافظة دير الزور - ناحية البصيرة',
    headerLine3: 'مجلس بلدية طيب الفال',
    logoPath: ''
  });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [printModal, setPrintModal] = useState<{show: boolean, data: any}>({show: false, data: null});
  const [printOptions, setPrintOptions] = useState({
    showPhoto: true,
    showName: true,
    showId: true,
    showDepartment: true,
    showStatus: true,
    showPersonal: true,
    showJob: true,
    layout: 'landscape'
  });
  const userRole = localStorage.getItem('userRole') || 'viewer';
  
  useEffect(() => {
    fetchEmployees();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('الرجاء إدخال الاسم الكامل');
      return;
    }
    
    setIsSubmitting(true);
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null && key !== 'id') {
        form.append(key, formData[key] as string | Blob);
      }
    });
    
    const url = formData.id ? `/api/employees/${formData.id}` : '/api/employees';
    const method = formData.id ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, { method, body: form });
      if (!response.ok) {
        throw new Error('فشل حفظ البيانات');
      }
      setShowModal(false);
      setFormData({});
      fetchEmployees();
      alert(formData.id ? 'تم تعديل بيانات الموظف بنجاح' : 'تم إضافة الموظف بنجاح');
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('فشل الحذف');
        fetchEmployees();
        alert('تم حذف الموظف بنجاح');
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const executePrint = (emp: any, options: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html dir="rtl">
        <head>
          <title>بطاقة موظف - ${emp.name}</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a3622; padding-bottom: 20px; }
            .logo { width: 80px; height: 80px; margin-bottom: 10px; }
            .title { color: #1a3622; font-size: 24px; font-weight: bold; margin: 0; }
            .subtitle { color: #666; font-size: 16px; margin: 5px 0; }
            .card { border: 1px solid #ccc; border-radius: 8px; padding: 20px; display: flex; gap: 20px; ${options.layout === 'portrait' ? 'flex-direction: column; align-items: center;' : ''} }
            .photo { width: 120px; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #d4af37; }
            .details { flex: 1; ${options.layout === 'portrait' ? 'width: 100%;' : ''} }
            .row { display: flex; margin-bottom: 10px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
            .label { width: 150px; font-weight: bold; color: #1a3622; }
            .value { flex: 1; }
            .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding: 0 50px; }
            .sig-box { text-align: center; }
            .sig-line { border-top: 1px solid #000; width: 150px; margin-top: 40px; }
            @media print {
              body { padding: 0; }
              .card { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${settings.logoPath || SYRIAN_EAGLE_LOGO}" class="logo" alt="شعار البلدية" />
            <p class="subtitle">${settings.headerLine1}<br/>${settings.headerLine2}<br/>${settings.headerLine3}</p>
            <h1 class="title">بطاقة البيانات الوظيفية</h1>
          </div>
          
          <div class="card">
            ${options.showPhoto ? (emp.photoPath ? `<img src="${emp.photoPath}" class="photo" />` : '<div class="photo" style="background:#eee;display:flex;align-items:center;justify-content:center;">لا توجد صورة</div>') : ''}
            <div class="details">
              ${options.showName ? `<div class="row"><div class="label">الاسم الكامل:</div><div class="value">${emp.name || '-'}</div></div>` : ''}
              ${options.showId ? `<div class="row"><div class="label">الرقم الوظيفي:</div><div class="value">${emp.employeeId || '-'}</div></div>` : ''}
              ${options.showDepartment ? `<div class="row"><div class="label">القسم:</div><div class="value">${emp.department || '-'}</div></div>` : ''}
              ${options.showStatus ? `<div class="row"><div class="label">حالة الخدمة:</div><div class="value">${emp.serviceStatus || '-'}</div></div>` : ''}
              
              ${options.showPersonal ? `
                <div style="margin-top: 15px; margin-bottom: 5px; font-weight: bold; color: #d4af37; border-bottom: 1px solid #d4af37; padding-bottom: 3px;">المعلومات الشخصية والاجتماعية</div>
                <div class="row"><div class="label">الرقم الوطني:</div><div class="value">${emp.nationalId || '-'}</div></div>
                <div class="row"><div class="label">اسم الأم:</div><div class="value">${emp.motherName || '-'}</div></div>
                <div class="row"><div class="label">الجنسية:</div><div class="value">${emp.nationality || '-'}</div></div>
                <div class="row"><div class="label">الديانة:</div><div class="value">${emp.religion || '-'}</div></div>
                <div class="row"><div class="label">الجنس:</div><div class="value">${emp.gender || '-'}</div></div>
                <div class="row"><div class="label">تاريخ ومكان الولادة:</div><div class="value">${emp.dob || '-'} / ${emp.pob || '-'}</div></div>
                <div class="row"><div class="label">الوضع العائلي:</div><div class="value">${emp.maritalStatus || '-'} ${emp.childrenCount ? `(${emp.childrenCount} أولاد)` : ''}</div></div>
                <div class="row"><div class="label">رقم الهاتف:</div><div class="value" dir="ltr" style="text-align: right;">${emp.phone || '-'}</div></div>
                <div class="row"><div class="label">رقم الطوارئ:</div><div class="value" dir="ltr" style="text-align: right;">${emp.emergencyContact || '-'}</div></div>
                <div class="row"><div class="label">العنوان:</div><div class="value">${emp.address || '-'}</div></div>
                <div class="row"><div class="label">زمرة الدم:</div><div class="value" dir="ltr" style="text-align: right;">${emp.bloodType || '-'}</div></div>
              ` : ''}

              ${options.showJob ? `
                <div style="margin-top: 15px; margin-bottom: 5px; font-weight: bold; color: #d4af37; border-bottom: 1px solid #d4af37; padding-bottom: 3px;">المعلومات الوظيفية</div>
                <div class="row"><div class="label">المسمى الوظيفي:</div><div class="value">${emp.jobTitle || '-'}</div></div>
                <div class="row"><div class="label">المؤهل العلمي:</div><div class="value">${emp.education || '-'}</div></div>
                <div class="row"><div class="label">الفئة/المرتبة:</div><div class="value">${emp.category || '-'}</div></div>
                <div class="row"><div class="label">تاريخ المباشرة:</div><div class="value">${emp.hireDate || '-'}</div></div>
                <div class="row"><div class="label">الخبرات السابقة:</div><div class="value">${emp.previousEmployment || '-'}</div></div>
                <div class="row"><div class="label">ملاحظات:</div><div class="value">${emp.notes || '-'}</div></div>
              ` : ''}
            </div>
          </div>

          <div class="signatures">
            <div class="sig-box">
              <div>توقيع الموظف</div>
              <div class="sig-line"></div>
            </div>
            <div class="sig-box">
              <div>مدير الشؤون الإدارية</div>
              <div class="sig-line"></div>
            </div>
            <div class="sig-box">
              <div>رئيس البلدية</div>
              <div class="sig-line"></div>
            </div>
          </div>
          
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    setPrintModal({show: false, data: null});
  };

  const filtered = employees.filter(e => 
    e.name?.includes(search) || e.employeeId?.includes(search)
  );

  const executePrintList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html dir="rtl">
        <head>
          <title>قائمة الموظفين</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { width: 60px; height: 60px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: right; }
            th { background-color: #1a3622; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @media print {
              body { padding: 0; }
              @page { size: landscape; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${settings.logoPath || SYRIAN_EAGLE_LOGO}" class="logo" alt="شعار البلدية" />
            <h2>${settings.headerLine3}</h2>
            <h3>قائمة الموظفين</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>الرقم الوظيفي</th>
                <th>الاسم</th>
                <th>الرقم الوطني</th>
                <th>القسم</th>
                <th>المسمى الوظيفي</th>
                <th>الجنسية</th>
                <th>الديانة</th>
                <th>الوضع العائلي</th>
                <th>رقم الهاتف</th>
                <th>رقم الطوارئ</th>
                <th>الخبرات السابقة</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(emp => `
                <tr>
                  <td>${emp.employeeId || '-'}</td>
                  <td>${emp.name || '-'}</td>
                  <td>${emp.nationalId || '-'}</td>
                  <td>${emp.department || '-'}</td>
                  <td>${emp.jobTitle || '-'}</td>
                  <td>${emp.nationality || '-'}</td>
                  <td>${emp.religion || '-'}</td>
                  <td>${emp.maritalStatus || '-'}</td>
                  <td dir="ltr" style="text-align: right;">${emp.phone || '-'}</td>
                  <td dir="ltr" style="text-align: right;">${emp.emergencyContact || '-'}</td>
                  <td>${emp.previousEmployment || '-'}</td>
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
    const dataToExport = filtered.map(emp => ({
      'الرقم الوظيفي': emp.employeeId || '-',
      'الاسم الكامل': emp.name || '-',
      'القسم': emp.department || '-',
      'المسمى الوظيفي': emp.jobTitle || '-',
      'حالة الخدمة': emp.serviceStatus || '-',
      'الرقم الوطني': emp.nationalId || '-',
      'اسم الأم': emp.motherName || '-',
      'زمرة الدم': emp.bloodType || '-',
      'الجنسية': emp.nationality || '-',
      'الجنس': emp.gender || '-',
      'تاريخ الميلاد': emp.dob || '-',
      'مكان الولادة': emp.pob || '-',
      'الوضع العائلي': emp.maritalStatus || '-',
      'عدد الأولاد': emp.childrenCount || '0',
      'رقم الهاتف': emp.phone || '-',
      'رقم الطوارئ': emp.emergencyContact || '-',
      'العنوان': emp.address || '-',
      'المؤهل العلمي': emp.education || '-',
      'الفئة/المرتبة': emp.category || '-',
      'تاريخ المباشرة': emp.hireDate || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الموظفين");
    
    // Set RTL direction for the worksheet
    if (!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ rightToLeft: true });

    XLSX.writeFile(workbook, "قائمة_الموظفين.xlsx");
  };

  const executePrintIdCard = (emp: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const baseUrl = window.location.origin;
    const qrData = encodeURIComponent(`${baseUrl}/employees/${emp.id || emp.employeeId}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}&margin=0`;

    const getDeptColor = (dept: string) => {
      switch(dept) {
        case 'الإدارة': return '#1a3622';
        case 'الشؤون الفنية': return '#1976d2';
        case 'النظافة والبيئة': return '#f57f17';
        case 'مرآب الآليات': return '#d32f2f';
        case 'الشؤون المالية': return '#7b1fa2';
        case 'الشؤون القانونية': return '#5d4037';
        case 'الديوان': return '#00838f';
        default: return '#1a3622';
      }
    };

    const deptColor = getDeptColor(emp.department);
    const islamicPattern = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23000000' fill-opacity='0.03' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

    const html = `
      <html dir="rtl">
        <head>
          <title>بطاقة هوية - ${emp.name}</title>
          <style>
            body { 
              font-family: 'Cairo', Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              gap: 20px; 
              justify-content: center; 
              background: #f0f0f0; 
            }
            .id-card { 
              width: 85.6mm; 
              height: 54mm; 
              background-color: white; 
              background-image: url("${islamicPattern}");
              border-radius: 3mm; 
              box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
              position: relative; 
              overflow: hidden; 
              box-sizing: border-box;
              border: 1px solid #ccc;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 60%;
              opacity: 0.08;
              z-index: 0;
              pointer-events: none;
            }
            .card-front {
              display: flex;
              flex-direction: column;
              height: 100%;
              position: relative;
              z-index: 1;
            }
            .card-header {
              background: ${deptColor};
              color: white;
              padding: 4px 8px;
              display: flex;
              align-items: center;
              gap: 8px;
              height: 14mm;
            }
            .card-header img {
              height: 10mm;
              width: 10mm;
              background: white;
              border-radius: 50%;
              padding: 1px;
            }
            .card-header-text {
              font-size: 8px;
              line-height: 1.2;
              flex: 1;
              font-weight: bold;
            }
            .card-body {
              display: flex;
              padding: 6px;
              gap: 8px;
              flex: 1;
            }
            .card-photo {
              width: 22mm;
              height: 28mm;
              border: 2px solid ${deptColor};
              border-radius: 4px;
              object-fit: cover;
              background: white;
            }
            .card-info {
              flex: 1;
              font-size: 9px;
              line-height: 1.3;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2px 6px;
            }
            .info-group {
              margin-bottom: 2px;
            }
            .info-group.full-width {
              grid-column: 1 / -1;
            }
            .card-info .label {
              color: #555;
              font-size: 6px;
              margin-bottom: 1px;
            }
            .card-info .value {
              font-weight: bold;
              color: #111;
              font-size: 8.5px;
            }
            .card-footer {
              background: ${deptColor};
              color: white;
              text-align: center;
              font-size: 8px;
              font-weight: bold;
              padding: 3px 0;
            }
            
            /* Back of the card */
            .card-back {
              padding: 10px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              text-align: center;
              height: 100%;
              position: relative;
              z-index: 1;
            }
            .card-back-text {
              font-size: 9px;
              line-height: 1.6;
              color: #333;
              flex: 1;
            }
            .card-back-title {
              font-weight: bold;
              color: ${deptColor};
              margin-bottom: 5px;
              font-size: 11px;
            }
            .qr-container {
              margin-top: auto;
              padding-top: 5px;
            }
            .qr-code {
              width: 18mm;
              height: 18mm;
              border: 1px solid #ddd;
              padding: 2px;
              background: white;
              border-radius: 4px;
            }
            
            @media print {
              body { background: white; padding: 0; }
              .id-card { box-shadow: none; page-break-inside: avoid; }
              @page { margin: 0; size: auto; }
            }
          </style>
        </head>
        <body>
          <!-- الوجه الأمامي -->
          <div class="id-card">
            <img src="${settings.logoPath || SYRIAN_EAGLE_LOGO}" class="watermark" alt="Watermark" />
            <div class="card-front">
              <div class="card-header">
                <img src="${settings.logoPath || SYRIAN_EAGLE_LOGO}" alt="Logo" />
                <div class="card-header-text">
                  ${settings.headerLine1}<br/>
                  ${settings.headerLine2}<br/>
                  ${settings.headerLine3}
                </div>
              </div>
              <div class="card-body">
                ${emp.photoPath ? `<img src="${emp.photoPath}" class="card-photo" />` : `<div class="card-photo" style="display:flex;align-items:center;justify-content:center;font-size:8px;color:#999;">بدون صورة</div>`}
                <div class="card-info">
                  <div class="info-group full-width">
                    <div class="label">الاسم الكامل</div>
                    <div class="value" style="font-size: 11px; color: ${deptColor};">${emp.name || '-'}</div>
                  </div>
                  <div class="info-group">
                    <div class="label">المسمى الوظيفي</div>
                    <div class="value">${emp.jobTitle || '-'}</div>
                  </div>
                  <div class="info-group">
                    <div class="label">القسم</div>
                    <div class="value">${emp.department || '-'}</div>
                  </div>
                  <div class="info-group">
                    <div class="label">الرقم الوظيفي</div>
                    <div class="value">${emp.employeeId || '-'}</div>
                  </div>
                  <div class="info-group">
                    <div class="label">الرقم الوطني</div>
                    <div class="value">${emp.nationalId || '-'}</div>
                  </div>
                  <div class="info-group">
                    <div class="label">اسم الأم</div>
                    <div class="value">${emp.motherName || '-'}</div>
                  </div>
                  <div class="info-group">
                    <div class="label">زمرة الدم</div>
                    <div class="value" dir="ltr" style="text-align: right; color: #d32f2f;">${emp.bloodType || '-'}</div>
                  </div>
                </div>
              </div>
              <div class="card-footer">
                بطاقة تعريف موظف
              </div>
            </div>
          </div>

          <!-- الوجه الخلفي -->
          <div class="id-card">
            <img src="${settings.logoPath || SYRIAN_EAGLE_LOGO}" class="watermark" alt="Watermark" />
            <div class="card-back">
              <div class="card-back-text">
                <div class="card-back-title">تعليمات هامة</div>
                هذه البطاقة ملك لمجلس بلدية طيب الفال.<br/>
                يجب إبراز هذه البطاقة عند الطلب أثناء أوقات الدوام الرسمي.<br/>
                في حال فقدان هذه البطاقة يرجى إعادتها إلى قسم الشؤون الإدارية.<br/>
                <br/>
                <strong>توقيع المدير المختص</strong><br/>
                .......................
              </div>
              <div class="qr-container">
                <img src="${qrUrl}" class="qr-code" alt="QR Code" />
              </div>
            </div>
          </div>
          
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
        <h1 className="text-3xl font-bold text-[#1a3622]">إدارة الموظفين</h1>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            تصدير Excel
          </button>
          <button
            onClick={executePrintList}
            className="bg-white text-[#1a3622] border border-[#1a3622] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Printer size={20} />
            طباعة القائمة
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => { setFormData({}); setShowModal(true); }}
              className="bg-[#d4af37] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-600 transition-colors"
            >
              <Plus size={20} />
              إضافة موظف
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="بحث بالاسم أو الرقم الوظيفي..."
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
                <th className="p-4 font-medium">الصورة</th>
                <th className="p-4 font-medium">الرقم الوظيفي</th>
                <th className="p-4 font-medium">الاسم</th>
                <th className="p-4 font-medium">القسم</th>
                <th className="p-4 font-medium">حالة الخدمة</th>
                <th className="p-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    {emp.photoPath ? (
                      <img src={emp.photoPath} alt={emp.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {emp.name?.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="p-4">{emp.employeeId}</td>
                  <td className="p-4 font-medium text-gray-900">{emp.name}</td>
                  <td className="p-4 text-gray-600">{emp.department}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      emp.serviceStatus === 'في الخدمة' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {emp.serviceStatus || 'غير محدد'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    {userRole === 'admin' && (
                      <>
                        <button onClick={() => { setFormData(emp); setShowModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="تعديل">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(emp.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="حذف">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                    <button onClick={() => setPrintModal({show: true, data: emp})} className="p-1 text-gray-600 hover:bg-gray-100 rounded" title="طباعة بيانات الموظف (A4)">
                      <Printer size={18} />
                    </button>
                    <button onClick={() => executePrintIdCard(emp)} className="p-1 text-[#1a3622] hover:bg-green-50 rounded" title="طباعة بطاقة هوية (للمحفظة)">
                      <IdCard size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">لا يوجد موظفين لعرضهم</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#1a3622]">
                {formData.id ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* المعلومات الشخصية */}
              <div>
                <h3 className="text-lg font-bold text-[#1a3622] mb-4 border-b pb-2">المعلومات الشخصية والاجتماعية</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الرقم الوطني</label>
                    <input type="text" value={formData.nationalId || ''} onChange={e => setFormData({...formData, nationalId: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم الأم</label>
                    <input type="text" value={formData.motherName || ''} onChange={e => setFormData({...formData, motherName: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الجنسية</label>
                    <input type="text" value={formData.nationality || ''} onChange={e => setFormData({...formData, nationality: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الديانة</label>
                    <input type="text" value={formData.religion || ''} onChange={e => setFormData({...formData, religion: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                    <select value={formData.gender || ''} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر الجنس</option>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                    <input type="date" value={formData.dob || ''} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مكان الولادة</label>
                    <input type="text" value={formData.pob || ''} onChange={e => setFormData({...formData, pob: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوضع العائلي</label>
                    <select value={formData.maritalStatus || ''} onChange={e => setFormData({...formData, maritalStatus: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر الحالة</option>
                      <option value="أعزب">أعزب</option>
                      <option value="متزوج">متزوج</option>
                      <option value="مطلق">مطلق</option>
                      <option value="أرمل">أرمل</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عدد الأولاد</label>
                    <input type="number" min="0" value={formData.childrenCount || ''} onChange={e => setFormData({...formData, childrenCount: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">زمرة الدم</label>
                    <select value={formData.bloodType || ''} onChange={e => setFormData({...formData, bloodType: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر الزمرة</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                    <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الطوارئ</label>
                    <input type="text" value={formData.emergencyContact || ''} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" dir="ltr" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                    <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                </div>
              </div>

              {/* المعلومات الوظيفية */}
              <div>
                <h3 className="text-lg font-bold text-[#1a3622] mb-4 border-b pb-2">المعلومات الوظيفية والإدارية</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الرقم الوظيفي *</label>
                    <input type="text" value={formData.employeeId || ''} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                    <select value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر القسم</option>
                      <option value="الإدارة">الإدارة</option>
                      <option value="الشؤون الفنية">الشؤون الفنية</option>
                      <option value="النظافة والبيئة">النظافة والبيئة</option>
                      <option value="مرآب الآليات">مرآب الآليات</option>
                      <option value="الشؤون المالية">الشؤون المالية</option>
                      <option value="الشؤون القانونية">الشؤون القانونية</option>
                      <option value="الديوان">الديوان</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي</label>
                    <select value={formData.jobTitle || ''} onChange={e => setFormData({...formData, jobTitle: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر المسمى</option>
                      <option value="رئيس مجلس">رئيس مجلس</option>
                      <option value="مدير">مدير</option>
                      <option value="مهندس">مهندس</option>
                      <option value="محاسب">محاسب</option>
                      <option value="إداري">إداري</option>
                      <option value="مراقب">مراقب</option>
                      <option value="سائق">سائق</option>
                      <option value="عامل">عامل</option>
                      <option value="حارس">حارس</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المؤهل العلمي</label>
                    <select value={formData.education || ''} onChange={e => setFormData({...formData, education: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر المؤهل</option>
                      <option value="إجازة جامعية">إجازة جامعية</option>
                      <option value="معهد متوسط">معهد متوسط</option>
                      <option value="ثانوية عامة">ثانوية عامة</option>
                      <option value="إعدادية">إعدادية</option>
                      <option value="ابتدائية">ابتدائية</option>
                      <option value="يقرأ ويكتب">يقرأ ويكتب</option>
                      <option value="بدون مؤهل">بدون مؤهل</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة / المرتبة</label>
                    <select value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر الفئة</option>
                      <option value="الفئة الأولى">الفئة الأولى</option>
                      <option value="الفئة الثانية">الفئة الثانية</option>
                      <option value="الفئة الثالثة">الفئة الثالثة</option>
                      <option value="الفئة الرابعة">الفئة الرابعة</option>
                      <option value="الفئة الخامسة">الفئة الخامسة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ المباشرة</label>
                    <input type="date" value={formData.hireDate || ''} onChange={e => setFormData({...formData, hireDate: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">حالة الخدمة</label>
                    <select value={formData.serviceStatus || ''} onChange={e => setFormData({...formData, serviceStatus: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر الحالة</option>
                      <option value="في الخدمة">في الخدمة</option>
                      <option value="منتهي الخدمة">منتهي الخدمة</option>
                      <option value="إجازة">إجازة</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">صورة الموظف</label>
                    <input type="file" accept="image/*" onChange={e => setFormData({...formData, photo: e.target.files?.[0]})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">الخبرات السابقة / العمل السابق</label>
                    <textarea value={formData.previousEmployment || ''} onChange={e => setFormData({...formData, previousEmployment: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" rows={2}></textarea>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية</label>
                    <textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" rows={2}></textarea>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" disabled={isSubmitting}>إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-[#1a3622] text-white rounded-lg hover:bg-[#2a4a32] disabled:opacity-50" disabled={isSubmitting}>
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {printModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1a3622]">خيارات الطباعة</h2>
              <button onClick={() => setPrintModal({show: false, data: null})} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="font-medium text-gray-900">الحقول المراد طباعتها:</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showPhoto} onChange={e => setPrintOptions({...printOptions, showPhoto: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  الصورة الشخصية
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showName} onChange={e => setPrintOptions({...printOptions, showName: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  الاسم الكامل
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showId} onChange={e => setPrintOptions({...printOptions, showId: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  الرقم الوظيفي
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showDepartment} onChange={e => setPrintOptions({...printOptions, showDepartment: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  القسم
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showStatus} onChange={e => setPrintOptions({...printOptions, showStatus: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  حالة الخدمة
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showPersonal} onChange={e => setPrintOptions({...printOptions, showPersonal: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  المعلومات الشخصية والاجتماعية
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showJob} onChange={e => setPrintOptions({...printOptions, showJob: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  المعلومات الوظيفية والإدارية
                </label>
              </div>

              <h3 className="font-medium text-gray-900 mt-4">تخطيط البطاقة:</h3>
              <select 
                value={printOptions.layout} 
                onChange={e => setPrintOptions({...printOptions, layout: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]"
              >
                <option value="landscape">بطاقة بيانات (أفقي)</option>
                <option value="portrait">بطاقة بيانات (عمودي)</option>
              </select>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setPrintModal({show: false, data: null})} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button>
              <button onClick={() => executePrint(printModal.data, printOptions)} className="px-4 py-2 bg-[#1a3622] text-white rounded-lg hover:bg-[#2a4a32] flex items-center gap-2">
                <Printer size={18} />
                طباعة الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
