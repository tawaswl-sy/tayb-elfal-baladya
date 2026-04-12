import React, { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Edit, Trash2, Search, Printer, Download, Filter, User, Phone, MapPin, Calendar, Info, Users, Briefcase, Home, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { exportToExcel, printTable } from '../../utils/exportUtils';
import LocationPicker from '../../components/databank/LocationPicker';

const priorities = ['عادي', 'متوسط', 'عالي', 'طارئ'];
const statuses = ['نشط', 'مكتمل', 'مرفوض', 'قيد الدراسة'];
const verificationStatuses = ['غير محقق', 'محقق ميدانياً', 'بانتظار الوثائق'];

const categories = [
  'أرملة',
  'مطلقة',
  'يتيم',
  'ذوي احتياجات خاصة',
  'أمراض مزمنة',
  'معسر',
  'أخرى'
];

const socialStatuses = [
  'أعزب',
  'متزوج',
  'مطلق',
  'أرمل'
];

export default function SocialSupport() {
  const [cases, setCases] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('الكل');
  const [filterEntity, setFilterEntity] = useState('الكل');
  const [filterPriority, setFilterPriority] = useState('الكل');
  const [filterVerification, setFilterVerification] = useState('الكل');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSupport, setNewSupport] = useState({ type: '', date: '', entity: '' });
  const [newMember, setNewMember] = useState({ name: '', age: '', relation: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    category: 'أرملة',
    gender: 'أنثى',
    birthDate: '',
    socialStatus: 'أعزب',
    familyCount: 0,
    phone: '',
    address: '',
    jobStatus: 'بلا عمل',
    housingStatus: 'ملك',
    monthlyIncome: 0,
    healthStatus: '',
    financialStatus: '',
    notes: '',
    priority: 'عادي',
    status: 'نشط',
    verificationStatus: 'غير محقق',
    latitude: 33.5138,
    longitude: 36.2765,
    supportHistory: [] as any[],
    familyMembers: [] as any[]
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/databank/social-support');
      if (res.ok) {
        setCases(await res.json());
      }
    } catch (error) {
      console.error('Error fetching social support cases:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/databank/social-support/${editingId}` : '/api/databank/social-support';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchCases();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving case:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحالة؟')) return;
    try {
      const res = await fetch(`/api/databank/social-support/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCases();
    } catch (error) {
      console.error('Error deleting case:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      fullName: '',
      nationalId: '',
      category: 'أرملة',
      gender: 'أنثى',
      birthDate: '',
      socialStatus: 'أعزب',
      familyCount: 0,
      phone: '',
      address: '',
      jobStatus: 'بلا عمل',
      housingStatus: 'ملك',
      monthlyIncome: 0,
      healthStatus: '',
      financialStatus: '',
      notes: '',
      priority: 'عادي',
      status: 'نشط',
      verificationStatus: 'غير محقق',
      latitude: 33.5138,
      longitude: 36.2765,
      supportHistory: [],
      familyMembers: []
    });
  };

  const addSupportRecord = () => {
    if (!newSupport.type || !newSupport.date || !newSupport.entity) {
      alert('يرجى إكمال بيانات الدعم (النوع، التاريخ، الجهة)');
      return;
    }
    setFormData({
      ...formData,
      supportHistory: [...(formData.supportHistory || []), { ...newSupport, id: Date.now().toString() }]
    });
    setNewSupport({ type: '', date: '', entity: '' });
  };

  const removeSupportRecord = (id: string) => {
    setFormData({
      ...formData,
      supportHistory: formData.supportHistory.filter((s: any) => s.id !== id)
    });
  };

  const addFamilyMember = () => {
    if (!newMember.name) return;
    setFormData({
      ...formData,
      familyMembers: [...(formData.familyMembers || []), { ...newMember, id: Date.now().toString() }]
    });
    setNewMember({ name: '', age: '', relation: '' });
  };

  const removeFamilyMember = (id: string) => {
    setFormData({
      ...formData,
      familyMembers: formData.familyMembers.filter((m: any) => m.id !== id)
    });
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case 'طارئ': return 'bg-red-100 text-red-700 border-red-200';
      case 'عالي': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'متوسط': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'نشط': return 'text-green-600';
      case 'مكتمل': return 'text-blue-600';
      case 'مرفوض': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.fullName.includes(search) || c.nationalId.includes(search);
    const matchesCategory = filterCategory === 'الكل' || c.category === filterCategory;
    const matchesEntity = filterEntity === 'الكل' || c.supportHistory?.some((s: any) => s.entity === filterEntity);
    const matchesPriority = filterPriority === 'الكل' || c.priority === filterPriority;
    const matchesVerification = filterVerification === 'الكل' || c.verificationStatus === filterVerification;
    return matchesSearch && matchesCategory && matchesEntity && matchesPriority && matchesVerification;
  });

  const entities = Array.from(new Set(cases.flatMap(c => c.supportHistory?.map((s: any) => s.entity) || []))).filter(Boolean);

  const stats = {
    total: cases.length,
    byCategory: categories.reduce((acc: any, cat) => {
      acc[cat] = cases.filter(c => c.category === cat).length;
      return acc;
    }, {}),
    byPriority: priorities.reduce((acc: any, prio) => {
      acc[prio] = cases.filter(c => c.priority === prio).length;
      return acc;
    }, {}),
    totalSupportRecords: cases.reduce((acc, c) => acc + (c.supportHistory?.length || 0), 0)
  };

  const handleExportExcel = () => {
    const data = filteredCases.map(c => ({
      'الاسم الكامل': c.fullName,
      'الرقم الوطني': c.nationalId,
      'التصنيف': c.category,
      'الجنس': c.gender,
      'تاريخ الميلاد': c.birthDate,
      'الحالة الاجتماعية': c.socialStatus,
      'عدد أفراد الأسرة': c.familyCount,
      'رقم التواصل': c.phone,
      'العنوان': c.address,
      'الوضع الوظيفي': c.jobStatus,
      'وضع السكن': c.housingStatus,
      'الدخل الشهري': c.monthlyIncome,
      'الأولوية': c.priority,
      'حالة الملف': c.status,
      'حالة التحقق': c.verificationStatus,
      'الوضع الصحي': c.healthStatus,
      'الوضع المادي': c.financialStatus,
      'تاريخ آخر دعم': c.supportHistory?.[c.supportHistory.length - 1]?.date || 'لا يوجد',
      'آخر جهة داعمة': c.supportHistory?.[c.supportHistory.length - 1]?.entity || 'لا يوجد'
    }));
    exportToExcel(data, `سجل_الدعم_الاجتماعي_${filterCategory}`);
  };

  const handlePrint = () => {
    const columns = [
      'الاسم الكامل', 
      'الرقم الوطني',
      'التصنيف', 
      'الجنس',
      'تاريخ الميلاد',
      'الحالة الاجتماعية', 
      'أفراد الأسرة',
      'التواصل', 
      'العنوان', 
      'العمل/السكن',
      'الدخل الشهري',
      'الأولوية/الحالة',
      'التحقق',
      'أفراد الأسرة (تفصيلي)',
      'الوضع الصحي/المادي',
      'سجل الدعم'
    ];
    
    const data = filteredCases.map(c => [
      c.fullName,
      c.nationalId,
      c.category,
      c.gender,
      c.birthDate,
      c.socialStatus,
      c.familyCount,
      c.phone,
      c.address,
      `${c.jobStatus} / ${c.housingStatus}`,
      c.monthlyIncome,
      `${c.priority} / ${c.status}`,
      c.verificationStatus,
      c.familyMembers?.map((m: any) => `${m.name} (${m.age} سنة) - ${m.relation}`).join(' | ') || 'لا يوجد تفاصيل',
      `${c.healthStatus || 'سليم'} / ${c.financialStatus || 'مستور'}`,
      c.supportHistory?.map((s: any) => `${s.type} (${s.date}) - ${s.entity}`).join(' | ') || 'لا يوجد'
    ]);
    printTable(`سجل الدعم الاجتماعي التفصيلي - فئة: ${filterCategory}`, columns, data);
  };

  const handlePrintCase = (c: any) => {
    const content = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a3622; padding-bottom: 20px;">
          <h1 style="color: #1a3622; margin: 0;">ملف حالة اجتماعية</h1>
          <p style="color: #666;">الجمهورية العربية السورية - بلدية المنطقة</p>
          <p style="font-size: 12px; color: #999;">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SY')}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="border: 1px solid #eee; padding: 15px; border-radius: 10px;">
            <h3 style="margin-top: 0; color: #1a3622;">المعلومات الشخصية</h3>
            <p><strong>الاسم الكامل:</strong> ${c.fullName}</p>
            <p><strong>الرقم الوطني:</strong> ${c.nationalId}</p>
            <p><strong>تاريخ الميلاد:</strong> ${c.birthDate}</p>
            <p><strong>الجنس:</strong> ${c.gender}</p>
          </div>
          <div style="border: 1px solid #eee; padding: 15px; border-radius: 10px;">
            <h3 style="margin-top: 0; color: #1a3622;">الحالة الاجتماعية والتواصل</h3>
            <p><strong>التصنيف:</strong> ${c.category}</p>
            <p><strong>الحالة الاجتماعية:</strong> ${c.socialStatus}</p>
            <p><strong>رقم التواصل:</strong> ${c.phone}</p>
            <p><strong>العنوان:</strong> ${c.address}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #eee;">
          <h3 style="margin-top: 0; color: #1a3622; border-bottom: 1px solid #ddd; padding-bottom: 10px;">الوضع المعيشي والصحي</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <p><strong>العمل:</strong> ${c.jobStatus}</p>
            <p><strong>وضع السكن:</strong> ${c.housingStatus}</p>
            <p><strong>الدخل الشهري:</strong> ${c.monthlyIncome} ل.س</p>
            <p><strong>الأولوية:</strong> ${c.priority}</p>
            <p><strong>حالة الملف:</strong> ${c.status}</p>
            <p><strong>التحقق الميداني:</strong> ${c.verificationStatus}</p>
          </div>
          <div style="margin-top: 15px;">
            <p><strong>الوضع الصحي:</strong> ${c.healthStatus || 'سليم'}</p>
            <p><strong>الوضع المادي:</strong> ${c.financialStatus || 'مستور'}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #1a3622; border-bottom: 1px solid #ddd; padding-bottom: 10px;">أفراد الأسرة (${c.familyCount})</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead style="background: #f2f2f2;">
              <tr>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">الاسم</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">العمر</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">الصلة</th>
              </tr>
            </thead>
            <tbody>
              ${c.familyMembers?.length > 0 ? c.familyMembers.map((m: any) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">${m.name}</td>
                  <td style="border: 1px solid #ddd; padding: 10px;">${m.age}</td>
                  <td style="border: 1px solid #ddd; padding: 10px;">${m.relation}</td>
                </tr>
              `).join('') : '<tr><td colspan="3" style="text-align:center; padding: 15px; color: #999;">لا يوجد تفاصيل مسجلة لأفراد الأسرة</td></tr>'}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #1a3622; border-bottom: 1px solid #ddd; padding-bottom: 10px;">سجل الدعم المقدم</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead style="background: #f2f2f2;">
              <tr>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">نوع الدعم</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">التاريخ</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">الجهة الداعمة</th>
              </tr>
            </thead>
            <tbody>
              ${c.supportHistory?.length > 0 ? c.supportHistory.map((s: any) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">${s.type}</td>
                  <td style="border: 1px solid #ddd; padding: 10px;">${s.date}</td>
                  <td style="border: 1px solid #ddd; padding: 10px;">${s.entity}</td>
                </tr>
              `).join('') : '<tr><td colspan="3" style="text-align:center; padding: 15px; color: #999;">لا يوجد سجل دعم سابق لهذه الحالة</td></tr>'}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 80px; display: flex; justify-content: space-between;">
          <div style="text-align: center; width: 200px;">
            <p style="font-weight: bold;">توقيع الباحث الاجتماعي</p>
            <div style="height: 60px;"></div>
            <p>..................................</p>
          </div>
          <div style="text-align: center; width: 200px;">
            <p style="font-weight: bold;">ختم وتوقيع رئيس البلدية</p>
            <div style="height: 60px;"></div>
            <p>..................................</p>
          </div>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ملف حالة - ${c.fullName}</title>
            <style>
              @media print {
                body { margin: 0; }
                @page { size: A4; margin: 1cm; }
              }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-xl text-[#d4af37]">
            <HeartHandshake size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">سجل الدعم الاجتماعي</h1>
            <p className="text-gray-500 mt-1">إدارة بيانات الحالات الإنسانية والاجتماعية في البلدية</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors font-bold"
          >
            <Printer size={20} />
            طباعة القائمة
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors font-bold"
          >
            <Download size={20} />
            تصدير Excel
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-[#d4af37] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-yellow-600 transition-colors font-bold shadow-lg"
          >
            <Plus size={20} />
            إضافة حالة جديدة
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs text-gray-400 font-bold mb-1">إجمالي الحالات</p>
          <p className="text-2xl font-black text-[#1a3622]">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs text-gray-400 font-bold mb-1">إجمالي المساعدات</p>
          <p className="text-2xl font-black text-blue-600">{stats.totalSupportRecords}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center border-r-4 border-r-red-500">
          <p className="text-xs text-red-500 font-bold mb-1">حالات طارئة</p>
          <p className="text-2xl font-black text-red-600">{stats.byPriority['طارئ'] || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center border-r-4 border-r-orange-500">
          <p className="text-xs text-orange-500 font-bold mb-1">أولوية عالية</p>
          <p className="text-2xl font-black text-orange-600">{stats.byPriority['عالي'] || 0}</p>
        </div>
        {Object.entries(stats.byCategory).slice(0, 5).map(([cat, count]: any) => (
          <div key={cat} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] text-gray-400 font-bold mb-1 truncate">{cat}</p>
            <p className="text-xl font-black text-gray-800">{count}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="بحث بالاسم أو الرقم الوطني..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <Filter size={18} className="text-gray-400" />
            <span className="text-sm text-gray-500 font-bold">الفئة:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[#1a3622]"
            >
              <option value="الكل">جميع الفئات</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <HeartHandshake size={18} className="text-gray-400" />
            <span className="text-sm text-gray-500 font-bold">الجهة الداعمة:</span>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[#1a3622]"
            >
              <option value="الكل">جميع الجهات</option>
              {entities.map((ent: any) => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <AlertCircle size={18} className="text-gray-400" />
            <span className="text-sm text-gray-500 font-bold">الأولوية:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[#1a3622]"
            >
              <option value="الكل">جميع المستويات</option>
              {priorities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <CheckCircle size={18} className="text-gray-400" />
            <span className="text-sm text-gray-500 font-bold">التحقق:</span>
            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[#1a3622]"
            >
              <option value="الكل">الكل</option>
              {verificationStatuses.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold">الاسم الكامل</th>
                <th className="p-4 font-bold">التصنيف</th>
                <th className="p-4 font-bold">الحالة الاجتماعية</th>
                <th className="p-4 font-bold">الأولوية والحالة</th>
                <th className="p-4 font-bold">العمل والسكن</th>
                <th className="p-4 font-bold">التواصل</th>
                <th className="p-4 font-bold">العنوان</th>
                <th className="p-4 font-bold">الوضع المادي</th>
                <th className="p-4 font-bold w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(c => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{c.fullName}</span>
                      <span className="text-xs text-gray-400">{c.nationalId}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {c.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">{c.socialStatus}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border text-center ${getPriorityColor(c.priority)}`}>
                        {c.priority}
                      </span>
                      <span className={`text-[10px] font-bold text-center ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {c.verificationStatus === 'محقق ميدانياً' ? (
                          <CheckCircle size={10} className="text-green-500" />
                        ) : (
                          <Clock size={10} className="text-orange-400" />
                        )}
                        <span className="text-[9px] text-gray-400 whitespace-nowrap">{c.verificationStatus}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col text-xs gap-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{c.jobStatus}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{c.housingStatus}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone size={14} />
                      <span className="text-sm">{c.phone}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin size={14} />
                      <span className="text-sm">{c.address}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{c.financialStatus}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrintCase(c)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="طباعة ملف الحالة"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setFormData(c);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartHandshake size={32} />
              </div>
              <p className="text-gray-500 font-bold">لا توجد حالات مسجلة تطابق البحث</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <div className="bg-rose-50 p-3 rounded-2xl text-rose-600">
                <HeartHandshake size={24} />
              </div>
              <h2 className="text-2xl font-black text-gray-900">
                {editingId ? 'تعديل بيانات الحالة' : 'إضافة حالة دعم جديدة'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <User size={16} className="text-[#d4af37]" />
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                    placeholder="الاسم الثلاثي"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Info size={16} className="text-[#d4af37]" />
                    الرقم الوطني
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nationalId}
                    onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                    placeholder="11 خانة"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Filter size={16} className="text-[#d4af37]" />
                    تصنيف الحالة
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <User size={16} className="text-[#d4af37]" />
                    الجنس
                  </label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Calendar size={16} className="text-[#d4af37]" />
                    تاريخ الميلاد
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Users size={16} className="text-[#d4af37]" />
                    الحالة الاجتماعية
                  </label>
                  <select
                    value={formData.socialStatus}
                    onChange={e => setFormData({ ...formData, socialStatus: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                  >
                    {socialStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Users size={16} className="text-[#d4af37]" />
                    عدد أفراد الأسرة
                  </label>
                  <input
                    type="number"
                    value={formData.familyCount}
                    onChange={e => setFormData({ ...formData, familyCount: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Briefcase size={16} className="text-[#d4af37]" />
                    الوضع الوظيفي
                  </label>
                  <select
                    value={formData.jobStatus}
                    onChange={e => setFormData({ ...formData, jobStatus: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                  >
                    <option value="موظف">موظف</option>
                    <option value="عمل حر">عمل حر</option>
                    <option value="بلا عمل">بلا عمل</option>
                    <option value="متقاعد">متقاعد</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Home size={16} className="text-[#d4af37]" />
                    وضع السكن
                  </label>
                  <select
                    value={formData.housingStatus}
                    onChange={e => setFormData({ ...formData, housingStatus: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                  >
                    <option value="ملك">ملك</option>
                    <option value="آجار">آجار</option>
                    <option value="استضافة">استضافة</option>
                    <option value="مركز إيواء">مركز إيواء</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <DollarSign size={16} className="text-[#d4af37]" />
                    الدخل الشهري التقريبي
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={e => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <AlertCircle size={16} className="text-[#d4af37]" />
                    الأولوية
                  </label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                  >
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Clock size={16} className="text-[#d4af37]" />
                    حالة الملف
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <CheckCircle size={16} className="text-[#d4af37]" />
                    حالة التحقق الميداني
                  </label>
                  <select
                    value={formData.verificationStatus}
                    onChange={e => setFormData({ ...formData, verificationStatus: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                  >
                    {verificationStatuses.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Phone size={16} className="text-[#d4af37]" />
                    رقم التواصل
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                    placeholder="09xxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <MapPin size={16} className="text-[#d4af37]" />
                    العنوان التفصيلي
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
                    placeholder="الحي - الشارع - علامة مميزة"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="rounded-2xl overflow-hidden border border-gray-200">
                    <LocationPicker
                      lat={formData.latitude.toString()}
                      lng={formData.longitude.toString()}
                      onChange={(lat, lng) => setFormData({ ...formData, latitude: parseFloat(lat), longitude: parseFloat(lng) })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Info size={16} className="text-[#d4af37]" />
                  الوضع الصحي / المرضي
                </label>
                <textarea
                  value={formData.healthStatus}
                  onChange={e => setFormData({ ...formData, healthStatus: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all h-20"
                  placeholder="تفاصيل الحالة الصحية أو الإعاقة إن وجدت"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <DollarSign size={16} className="text-[#d4af37]" />
                  الوضع المادي والمعيشي
                </label>
                <textarea
                  value={formData.financialStatus}
                  onChange={e => setFormData({ ...formData, financialStatus: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all h-20"
                  placeholder="وصف الحالة المادية ومصادر الدخل"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Edit size={16} className="text-[#d4af37]" />
                  ملاحظات إضافية
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all h-20"
                />
              </div>

              {/* Family Members Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-black text-[#1a3622] flex items-center gap-2">
                  <Users size={20} className="text-[#d4af37]" />
                  تفاصيل أفراد الأسرة
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">الاسم</label>
                    <input
                      type="text"
                      placeholder="اسم الفرد"
                      value={newMember.name}
                      onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">العمر</label>
                    <input
                      type="number"
                      placeholder="العمر"
                      value={newMember.age}
                      onChange={e => setNewMember({ ...newMember, age: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">صلة القرابة</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ابن، ابنة، إلخ"
                        value={newMember.relation}
                        onChange={e => setNewMember({ ...newMember, relation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                      />
                      <button
                        type="button"
                        onClick={addFamilyMember}
                        className="bg-[#1a3622] text-white p-2 rounded-xl hover:bg-[#2a4a32]"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {formData.familyMembers?.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#1a3622]">{m.name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{m.age} سنة</span>
                        <span className="text-xs text-gray-400">{m.relation}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFamilyMember(m.id)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support History Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-black text-[#1a3622] flex items-center gap-2">
                  <HeartHandshake size={20} className="text-[#d4af37]" />
                  سجل الدعم المقدم
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">نوع الدعم</label>
                    <input
                      type="text"
                      placeholder="مثلاً: سلة غذائية"
                      value={newSupport.type}
                      onChange={e => setNewSupport({ ...newSupport, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">التاريخ</label>
                    <input
                      type="date"
                      value={newSupport.date}
                      onChange={e => setNewSupport({ ...newSupport, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">الجهة الداعمة</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="اسم المنظمة/الجهة"
                        value={newSupport.entity}
                        onChange={e => setNewSupport({ ...newSupport, entity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                      />
                      <button
                        type="button"
                        onClick={addSupportRecord}
                        className="bg-[#1a3622] text-white p-2 rounded-xl hover:bg-[#2a4a32]"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {formData.supportHistory?.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-[#1a3622]">{s.type}</span>
                        <span className="text-xs text-gray-400">{s.date}</span>
                        <span className="text-sm text-gray-600 font-medium">{s.entity}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSupportRecord(s.id)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {(!formData.supportHistory || formData.supportHistory.length === 0) && (
                    <p className="text-center text-gray-400 text-sm italic py-2">لا يوجد سجل دعم مضاف حالياً</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#1a3622] text-white px-6 py-4 rounded-2xl hover:bg-[#2a4a32] transition-all font-black shadow-xl shadow-green-900/20"
                >
                  {editingId ? 'تحديث البيانات' : 'حفظ الحالة'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl hover:bg-gray-200 transition-all font-black"
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

