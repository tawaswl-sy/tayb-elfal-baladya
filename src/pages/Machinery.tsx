import { useState, useEffect } from 'react';
import React from 'react';
import { Plus, Search, Edit, Trash2, Wrench, Printer, IdCard, Download } from 'lucide-react';
import { SYRIAN_EAGLE_LOGO } from '../lib/logo';
import * as XLSX from 'xlsx';

export default function Machinery() {
  const [machinery, setMachinery] = useState<any[]>([]);
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
  const [maintenanceModal, setMaintenanceModal] = useState<{show: boolean, data: any}>({show: false, data: null});
  const [maintenanceForm, setMaintenanceForm] = useState({ type: '', cost: '', notes: '' });
  const userRole = localStorage.getItem('userRole') || 'viewer';
  const [printOptions, setPrintOptions] = useState({
    showPhoto: true,
    showName: true,
    showPlate: true,
    showType: true,
    showStatus: true,
    showTechnical: true,
    showAdmin: true,
    layout: 'landscape'
  });
  
  useEffect(() => {
    fetchMachinery();
    fetchEmployees();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchMachinery = async () => {
    const res = await fetch('/api/machinery');
    const data = await res.json();
    setMachinery(data);
  };

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    setEmployees(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('الرجاء إدخال اسم الآلية / المعدة');
      return;
    }
    
    setIsSubmitting(true);
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null && key !== 'id') {
        form.append(key, formData[key] as string | Blob);
      }
    });
    
    const url = formData.id ? `/api/machinery/${formData.id}` : '/api/machinery';
    const method = formData.id ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, { method, body: form });
      if (!response.ok) {
        throw new Error('فشل حفظ البيانات');
      }
      setShowModal(false);
      setFormData({});
      fetchMachinery();
      alert(formData.id ? 'تم تعديل بيانات الآلية بنجاح' : 'تم إضافة الآلية بنجاح');
    } catch (error) {
      console.error('Error saving machinery:', error);
      alert('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الآلية؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        const response = await fetch(`/api/machinery/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('فشل الحذف');
        fetchMachinery();
        alert('تم حذف الآلية بنجاح');
      } catch (error) {
        console.error('Error deleting machinery:', error);
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceForm.type) {
      alert('الرجاء إدخال نوع الصيانة');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/machinery/${maintenanceModal.data.id}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceForm)
      });

      if (!response.ok) throw new Error('فشل حفظ سجل الصيانة');
      
      const updatedMachinery = await response.json();
      setMaintenanceModal({ show: true, data: updatedMachinery });
      setMaintenanceForm({ type: '', cost: '', notes: '' });
      fetchMachinery();
      alert('تم إضافة سجل الصيانة بنجاح');
    } catch (error) {
      console.error('Error saving maintenance:', error);
      alert('حدث خطأ أثناء حفظ سجل الصيانة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executePrint = (m: any, options: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate a QR code URL pointing to the machine's maintenance history (placeholder URL for now)
    const baseUrl = window.location.origin;
    const qrData = encodeURIComponent(`${baseUrl}/machinery/${m.id || m.plateNumber}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    const html = `
      <html dir="rtl">
        <head>
          <title>بطاقة آلية - ${m.name}</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a3622; padding-bottom: 20px; }
            .logo { width: 80px; height: 80px; margin-bottom: 10px; }
            .title { color: #1a3622; font-size: 24px; font-weight: bold; margin: 0; }
            .subtitle { color: #666; font-size: 16px; margin: 5px 0; }
            .card { border: 1px solid #ccc; border-radius: 8px; padding: 20px; display: flex; gap: 20px; ${options.layout === 'portrait' ? 'flex-direction: column; align-items: center;' : ''} position: relative; }
            .photo { width: 200px; height: 150px; object-fit: cover; border-radius: 8px; border: 2px solid #d4af37; }
            .qr-code { position: absolute; top: 20px; left: 20px; width: 100px; height: 100px; border: 1px solid #eee; padding: 5px; background: white; }
            .details { flex: 1; ${options.layout === 'portrait' ? 'width: 100%;' : ''} }
            .row { display: flex; margin-bottom: 10px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
            .label { width: 150px; font-weight: bold; color: #1a3622; }
            .value { flex: 1; }
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
            <h1 class="title">بطاقة تعريف آلية / معدة</h1>
          </div>
          
          <div class="card">
            <img src="${qrUrl}" class="qr-code" alt="QR Code" />
            ${options.showPhoto ? (m.photoPath ? `<img src="${m.photoPath}" class="photo" />` : '<div class="photo" style="background:#eee;display:flex;align-items:center;justify-content:center;">لا توجد صورة</div>') : ''}
            <div class="details">
              ${options.showName ? `<div class="row"><div class="label">اسم الآلية:</div><div class="value">${m.name || '-'}</div></div>` : ''}
              ${options.showPlate ? `<div class="row"><div class="label">رقم اللوحة:</div><div class="value">${m.plateNumber || '-'}</div></div>` : ''}
              ${options.showType ? `<div class="row"><div class="label">النوع:</div><div class="value">${m.type || '-'}</div></div>` : ''}
              ${options.showStatus ? `<div class="row"><div class="label">الحالة:</div><div class="value">${m.status || '-'}</div></div>` : ''}
              
              ${options.showTechnical ? `
                <div style="margin-top: 15px; margin-bottom: 5px; font-weight: bold; color: #d4af37; border-bottom: 1px solid #d4af37; padding-bottom: 3px;">المعلومات الفنية</div>
                <div class="row"><div class="label">سنة الصنع:</div><div class="value">${m.modelYear || '-'}</div></div>
                <div class="row"><div class="label">رقم الشاسيه:</div><div class="value">${m.chassisNumber || '-'}</div></div>
                <div class="row"><div class="label">رقم المحرك:</div><div class="value">${m.engineNumber || '-'}</div></div>
                <div class="row"><div class="label">نوع الوقود:</div><div class="value">${m.fuelType || '-'}</div></div>
              ` : ''}

              ${options.showAdmin ? `
                <div style="margin-top: 15px; margin-bottom: 5px; font-weight: bold; color: #d4af37; border-bottom: 1px solid #d4af37; padding-bottom: 3px;">المعلومات الإدارية</div>
                <div class="row"><div class="label">السائق/المشغل:</div><div class="value">${m.driverName || '-'}</div></div>
                <div class="row"><div class="label">الصيانة القادمة:</div><div class="value">${m.nextMaintenance || '-'}</div></div>
                <div class="row"><div class="label">انتهاء التأمين:</div><div class="value">${m.insuranceExpiry || '-'}</div></div>
                <div class="row"><div class="label">ملاحظات:</div><div class="value">${m.notes || '-'}</div></div>
              ` : ''}
            </div>
          </div>
          
          <script>
            window.onload = () => { 
              setTimeout(() => {
                window.print(); 
                window.close(); 
              }, 500);
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    setPrintModal({show: false, data: null});
  };

  const filtered = machinery.filter(m => 
    m.name?.includes(search) || m.plateNumber?.includes(search)
  );

  const executePrintList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html dir="rtl">
        <head>
          <title>قائمة الآليات والمعدات</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { width: 60px; height: 60px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #1a3622; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${settings.logoPath || SYRIAN_EAGLE_LOGO}" class="logo" alt="شعار البلدية" />
            <h2>${settings.headerLine3}</h2>
            <h3>قائمة الآليات والمعدات</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>اسم الآلية</th>
                <th>رقم اللوحة</th>
                <th>النوع</th>
                <th>الموديل</th>
                <th>الحالة</th>
                <th>السائق/المشغل</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(m => `
                <tr>
                  <td>${m.name || '-'}</td>
                  <td dir="ltr" style="text-align: right;">${m.plateNumber || '-'}</td>
                  <td>${m.type || '-'}</td>
                  <td>${m.modelYear || '-'}</td>
                  <td>${m.status || '-'}</td>
                  <td>${m.driverName || '-'}</td>
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
    const dataToExport = filtered.map(m => ({
      'اسم الآلية': m.name || '-',
      'رقم اللوحة': m.plateNumber || '-',
      'النوع': m.type || '-',
      'الحالة': m.status || '-',
      'سنة الصنع': m.modelYear || '-',
      'رقم الشاسيه': m.chassisNumber || '-',
      'رقم المحرك': m.engineNumber || '-',
      'نوع الوقود': m.fuelType || '-',
      'السائق/المشغل': m.driverName || '-',
      'تاريخ الصيانة القادمة': m.nextMaintenance || '-',
      'تاريخ انتهاء التأمين': m.insuranceExpiry || '-',
      'ملاحظات': m.notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الآليات");
    
    // Set RTL direction for the worksheet
    if (!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ rightToLeft: true });

    XLSX.writeFile(workbook, "قائمة_الآليات.xlsx");
  };

  const executePrintIdCard = (m: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const baseUrl = window.location.origin;
    const qrData = encodeURIComponent(`${baseUrl}/machinery/${m.id || m.plateNumber}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}&margin=0`;

    const html = `
      <html dir="rtl">
        <head>
          <title>بطاقة آلية - ${m.name}</title>
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
              background: white; 
              border-radius: 3mm; 
              box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
              position: relative; 
              overflow: hidden; 
              box-sizing: border-box;
              border: 1px solid #ccc;
            }
            .card-front, .card-back {
              display: flex;
              flex-direction: column;
              height: 100%;
            }
            .card-header {
              background: #1a3622;
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
            }
            .card-header-text {
              font-size: 8px;
              line-height: 1.2;
              flex: 1;
            }
            .card-body {
              display: flex;
              padding: 6px;
              gap: 8px;
              flex: 1;
            }
            .card-photo {
              width: 30mm;
              height: 22mm;
              border: 1px solid #d4af37;
              border-radius: 4px;
              object-fit: cover;
            }
            .card-info {
              flex: 1;
              font-size: 9px;
              line-height: 1.4;
            }
            .card-info .label {
              color: #666;
              font-size: 7px;
              margin-bottom: 1px;
            }
            .card-info .value {
              font-weight: bold;
              color: #1a3622;
              margin-bottom: 4px;
              font-size: 10px;
            }
            .card-footer {
              background: #d4af37;
              color: #1a3622;
              text-align: center;
              font-size: 8px;
              font-weight: bold;
              padding: 2px 0;
            }
            
            /* Back of the card */
            .card-back {
              padding: 8px;
              background: #fafafa;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .card-back::before {
              content: '';
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background-image: url('${settings.logoPath || SYRIAN_EAGLE_LOGO}');
              background-size: 50%;
              background-position: center;
              background-repeat: no-repeat;
              opacity: 0.1;
              z-index: 0;
              pointer-events: none;
            }
            .card-back > * {
              position: relative;
              z-index: 1;
            }
            .back-title {
              font-weight: bold;
              color: #1a3622;
              border-bottom: 1px solid #d4af37;
              padding-bottom: 2px;
              margin-bottom: 6px;
              font-size: 10px;
              text-align: center;
            }
            .back-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 4px 8px;
            }
            .back-notes {
              margin-top: 6px;
              font-size: 8px;
              color: #444;
              border-top: 1px dashed #ccc;
              padding-top: 4px;
            }
            .qr-container {
              display: flex;
              justify-content: center;
              margin-top: auto;
              padding-top: 4px;
            }
            .qr-code {
              width: 16mm;
              height: 16mm;
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
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  ${m.photoPath ? `<img src="${m.photoPath}" class="card-photo" />` : `<div class="card-photo" style="background:#eee;display:flex;align-items:center;justify-content:center;font-size:8px;">بدون صورة</div>`}
                  <div style="text-align: center; font-weight: bold; font-size: 12px; background: #eee; padding: 2px; border-radius: 2px; border: 1px solid #ccc;" dir="ltr">
                    ${m.plateNumber || 'بدون لوحة'}
                  </div>
                </div>
                <div class="card-info">
                  <div class="label">اسم الآلية / المعدة</div>
                  <div class="value">${m.name || '-'}</div>
                  
                  <div class="label">النوع / الفئة</div>
                  <div class="value">${m.type || '-'}</div>
                  
                  <div class="label">سنة الصنع</div>
                  <div class="value">${m.modelYear || '-'}</div>
                  
                  <div class="label">السائق / المشغل</div>
                  <div class="value">${m.driverName || '-'}</div>
                </div>
              </div>
              <div class="card-footer">
                بطاقة تعريف آلية
              </div>
            </div>
          </div>

          <!-- الوجه الخلفي -->
          <div class="id-card">
            <div class="card-back">
              <div>
                <div class="back-title">المعلومات الفنية والإدارية</div>
                <div class="back-grid">
                  <div class="card-info">
                    <div class="label">رقم الشاسيه</div>
                    <div class="value" dir="ltr" style="text-align: right;">${m.chassisNumber || '-'}</div>
                  </div>
                  <div class="card-info">
                    <div class="label">رقم المحرك</div>
                    <div class="value" dir="ltr" style="text-align: right;">${m.engineNumber || '-'}</div>
                  </div>
                  <div class="card-info">
                    <div class="label">نوع الوقود</div>
                    <div class="value">${m.fuelType || '-'}</div>
                  </div>
                  <div class="card-info">
                    <div class="label">الحالة الفنية</div>
                    <div class="value">${m.status || '-'}</div>
                  </div>
                  <div class="card-info">
                    <div class="label">تاريخ الصيانة القادمة</div>
                    <div class="value">${m.nextMaintenance || '-'}</div>
                  </div>
                  <div class="card-info">
                    <div class="label">انتهاء التأمين/الترسيم</div>
                    <div class="value">${m.insuranceExpiry || '-'}</div>
                  </div>
                </div>
                <div class="back-notes">
                  <strong>ملاحظات:</strong> ${m.notes || 'لا يوجد ملاحظات إضافية.'}
                </div>
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
        <h1 className="text-3xl font-bold text-[#1a3622]">إدارة الآليات والمعدات</h1>
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
              إضافة آلية
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم اللوحة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-100 relative">
                {m.photoPath ? (
                  <img src={m.photoPath} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    لا توجد صورة
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-sm font-bold shadow">
                  {m.plateNumber || 'بدون لوحة'}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{m.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{m.type} - {m.modelYear}</p>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    m.status === 'تعمل' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {m.status || 'غير محدد'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setMaintenanceModal({show: true, data: m})} className="p-2 text-orange-600 hover:bg-orange-50 rounded-full" title="سجل الصيانة">
                      <Wrench size={18} />
                    </button>
                    {userRole === 'admin' && (
                      <>
                        <button onClick={() => { setFormData(m); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="تعديل">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="حذف">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                    <button onClick={() => setPrintModal({show: true, data: m})} className="p-2 text-gray-600 hover:bg-gray-50 rounded-full" title="طباعة بيانات الآلية (A4)">
                      <Printer size={18} />
                    </button>
                    <button onClick={() => executePrintIdCard(m)} className="p-2 text-[#1a3622] hover:bg-green-50 rounded-full" title="طباعة بطاقة هوية (للمحفظة)">
                      <IdCard size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">لا توجد آليات لعرضها</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#1a3622]">
                {formData.id ? 'تعديل بيانات آلية' : 'إضافة آلية جديدة'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* المعلومات الأساسية */}
              <div>
                <h3 className="text-lg font-bold text-[#1a3622] mb-4 border-b pb-2">المعلومات الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم الآلية / المعدة *</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم اللوحة</label>
                    <input type="text" value={formData.plateNumber || ''} onChange={e => setFormData({...formData, plateNumber: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">النوع / الفئة</label>
                    <select value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر النوع</option>
                      <option value="سيارة سياحية">سيارة سياحية</option>
                      <option value="بيك آب">بيك آب</option>
                      <option value="ضاغطة قمامة">ضاغطة قمامة</option>
                      <option value="جرار">جرار</option>
                      <option value="تركس">تركس</option>
                      <option value="باكر">باكر</option>
                      <option value="قلاب">قلاب</option>
                      <option value="صهريج مياه">صهريج مياه</option>
                      <option value="رافعة">رافعة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة الفنية</label>
                    <select value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر الحالة</option>
                      <option value="تعمل">تعمل</option>
                      <option value="معطلة">معطلة</option>
                      <option value="في الصيانة">في الصيانة</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">صورة الآلية</label>
                    <input type="file" accept="image/*" onChange={e => setFormData({...formData, photo: e.target.files?.[0]})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                </div>
              </div>

              {/* المعلومات الفنية */}
              <div>
                <h3 className="text-lg font-bold text-[#1a3622] mb-4 border-b pb-2">المعلومات الفنية والإدارية</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">سنة الصنع</label>
                    <input type="number" value={formData.modelYear || ''} onChange={e => setFormData({...formData, modelYear: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الشاسيه (الهيكل)</label>
                    <input type="text" value={formData.chassisNumber || ''} onChange={e => setFormData({...formData, chassisNumber: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم المحرك</label>
                    <input type="text" value={formData.engineNumber || ''} onChange={e => setFormData({...formData, engineNumber: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع الوقود</label>
                    <select value={formData.fuelType || ''} onChange={e => setFormData({...formData, fuelType: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر النوع</option>
                      <option value="مازوت">مازوت</option>
                      <option value="بنزين">بنزين</option>
                      <option value="كهرباء">كهرباء</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم السائق / المشغل</label>
                    <select value={formData.driverName || ''} onChange={e => setFormData({...formData, driverName: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]">
                      <option value="">اختر السائق</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.name}>{emp.name} {emp.jobTitle ? `(${emp.jobTitle})` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الصيانة القادمة</label>
                    <input type="date" value={formData.nextMaintenance || ''} onChange={e => setFormData({...formData, nextMaintenance: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ انتهاء التأمين/الترسيم</label>
                    <input type="date" value={formData.insuranceExpiry || ''} onChange={e => setFormData({...formData, insuranceExpiry: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" />
                  </div>
                  <div className="md:col-span-2">
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

      {maintenanceModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#1a3622]">
                سجل الصيانة - {maintenanceModal.data.name}
              </h2>
              <button onClick={() => setMaintenanceModal({show: false, data: null})} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="p-6">
              {/* سجل الصيانة الحالي */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">السجل السابق</h3>
                {maintenanceModal.data.maintenanceLog && maintenanceModal.data.maintenanceLog.length > 0 ? (
                  <div className="space-y-4">
                    {maintenanceModal.data.maintenanceLog.map((log: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-[#1a3622]">{log.type}</span>
                          <span className="text-sm text-gray-500">{new Date(log.date).toLocaleDateString('ar-SY')}</span>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">التكلفة:</span> {log.cost} ل.س
                        </div>
                        <p className="text-sm text-gray-600">{log.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">لا يوجد سجل صيانة سابق لهذه الآلية</p>
                )}
              </div>

              {/* إضافة سجل جديد */}
              {userRole === 'admin' && (
                <form onSubmit={handleMaintenanceSubmit} className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">إضافة سجل صيانة جديد</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">نوع الصيانة *</label>
                      <input 
                        type="text" 
                        value={maintenanceForm.type} 
                        onChange={e => setMaintenanceForm({...maintenanceForm, type: e.target.value})} 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                        placeholder="مثال: تغيير زيت، إصلاح محرك..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">التكلفة (ل.س)</label>
                      <input 
                        type="number" 
                        value={maintenanceForm.cost} 
                        onChange={e => setMaintenanceForm({...maintenanceForm, cost: e.target.value})} 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">تفاصيل الصيانة وملاحظات</label>
                      <textarea 
                        value={maintenanceForm.notes} 
                        onChange={e => setMaintenanceForm({...maintenanceForm, notes: e.target.value})} 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      <Wrench size={18} />
                      {isSubmitting ? 'جاري الحفظ...' : 'حفظ السجل'}
                    </button>
                  </div>
                </form>
              )}
            </div>
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
                  صورة الآلية
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showName} onChange={e => setPrintOptions({...printOptions, showName: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  اسم الآلية
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showPlate} onChange={e => setPrintOptions({...printOptions, showPlate: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  رقم اللوحة
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showType} onChange={e => setPrintOptions({...printOptions, showType: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  النوع
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showStatus} onChange={e => setPrintOptions({...printOptions, showStatus: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  الحالة
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showTechnical} onChange={e => setPrintOptions({...printOptions, showTechnical: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  المعلومات الفنية
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={printOptions.showAdmin} onChange={e => setPrintOptions({...printOptions, showAdmin: e.target.checked})} className="rounded text-[#1a3622] focus:ring-[#1a3622]" />
                  المعلومات الإدارية
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
