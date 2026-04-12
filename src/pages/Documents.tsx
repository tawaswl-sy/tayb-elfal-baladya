import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { Folder, File, Upload, Trash2, Search, Download, Eye, X, Filter, Plus, Printer, FileText, CheckSquare } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';
import FileViewer from '../components/FileViewer';
import { SYRIAN_EAGLE_LOGO } from '../lib/logo';

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [search, setSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  
  // Add Document Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Print states
  const [printDoc, setPrintDoc] = useState<any | null>(null);
  const [taskDoc, setTaskDoc] = useState<any | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
    status: 'معلقة'
  });
  const [settings, setSettings] = useState<any>({});
  const userRole = localStorage.getItem('userRole') || 'viewer';
  
  const folders = ['الصادر', 'الوارد', 'التعاميم', 'الأرشيف', 'القرارات', 'المشاريع', 'العقود'];

  useEffect(() => {
    fetchDocuments();
    fetchSettings();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) setEmployees(await res.json());
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('الرجاء اختيار ملف');
      return;
    }
    
    setIsSubmitting(true);
    const form = new FormData();
    
    // Append metadata FIRST so multer can use it in destination/filename callbacks
    form.append('folder', formData.folder || currentFolder || 'الأرشيف');
    if (formData.documentNumber) form.append('documentNumber', formData.documentNumber);
    if (formData.documentDate) form.append('documentDate', formData.documentDate);
    if (formData.documenterName) form.append('documenterName', formData.documenterName);
    if (formData.subject) form.append('subject', formData.subject);
    if (formData.senderReceiver) form.append('senderReceiver', formData.senderReceiver);
    
    // Append file LAST
    form.append('files', selectedFile);
    
    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: form
      });
      if (!response.ok) throw new Error('فشل رفع المستند');
      setShowAddModal(false);
      setFormData({});
      setSelectedFile(null);
      fetchDocuments();
      alert('تم رفع المستند بنجاح');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('حدث خطأ أثناء رفع المستند');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddModal = async () => {
    const initialFolder = currentFolder || 'الصادر';
    let nextNum = '';
    
    try {
      if (initialFolder === 'الصادر' || initialFolder === 'الوارد') {
        const res = await fetch(`/api/documents/next-number?folder=${encodeURIComponent(initialFolder)}`);
        if (res.ok) {
          const data = await res.json();
          nextNum = data.nextNumber?.toString() || '';
        }
      }
    } catch (error) {
      console.error('Error fetching next number:', error);
    }
    
    setFormData({
      folder: initialFolder,
      documentNumber: nextNum,
      documentDate: new Date().toISOString().split('T')[0],
      documenterName: 'الديوان'
    });
    setSelectedFile(null);
    setShowAddModal(true);
  };

  const handleFolderChange = async (folder: string) => {
    setFormData({ ...formData, folder });
    if (folder === 'الصادر' || folder === 'الوارد') {
      try {
        const res = await fetch(`/api/documents/next-number?folder=${encodeURIComponent(folder)}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, folder, documentNumber: data.nextNumber?.toString() || '' }));
        }
      } catch (error) {
        console.error('Error fetching next number:', error);
      }
    }
  };

  const executePrint = () => {
    window.print();
  };

  const printActualDocument = (doc: any) => {
    const type = getFileType(doc.originalName || doc.name);
    if (type === 'pdf' || type === 'image' || type === 'text') {
      const printWindow = window.open(doc.path, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } else {
      alert('عذراً، لا يمكن طباعة هذا النوع من الملفات مباشرة. يرجى تحميله أولاً.');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await fetch(`/api/documents/${deleteConfirmId}`, { method: 'DELETE' });
        fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
      } finally {
        setDeleteConfirmId(null);
      }
    }
  };

  const handleConvertToTask = (doc: any) => {
    setTaskDoc(doc);
    setTaskFormData({
      title: `متابعة: ${doc.name}`,
      description: `متابعة الوثيقة رقم ${doc.documentNumber || ''} بخصوص ${doc.subject || doc.name}`,
      assignedTo: '',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'معلقة'
    });
  };

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskFormData)
      });
      if (res.ok) {
        alert('تم تحويل الوثيقة إلى مهمة بنجاح');
        setTaskDoc(null);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['txt', 'csv'].includes(ext || '')) return 'text';
    if (['doc', 'docx'].includes(ext || '')) return 'word';
    if (['xls', 'xlsx'].includes(ext || '')) return 'excel';
    return 'other';
  };

  const exportToExcel = () => {
    const dataToExport = filteredDocs.map(d => ({
      'المجلد': d.folder || '-',
      'اسم الملف': d.originalName || d.name || '-',
      'رقم الوثيقة': d.documentNumber || '-',
      'تاريخ الوثيقة': d.documentDate || '-',
      'الموضوع': d.subject || '-',
      'المرسل/المستلم': d.senderReceiver || '-',
      'اسم الموثق': d.documenterName || '-',
      'تاريخ الرفع': new Date(d.uploadDate).toLocaleString('ar-SA') || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الوثائق");
    
    // Set RTL direction for the worksheet
    if (!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ rightToLeft: true });

    XLSX.writeFile(workbook, "سجل_الوثائق.xlsx");
  };

  const filteredDocs = documents.filter(d => {
    const matchesFolder = currentFolder ? d.folder === currentFolder : true;
    const matchesSearch = d.name?.includes(search) || d.originalName?.includes(search);
    
    // Date filter
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const docDate = new Date(d.uploadDate);
      docDate.setHours(0, 0, 0, 0);
      
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (docDate < from) matchesDate = false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (docDate > to) matchesDate = false;
      }
    }

    // Type filter
    let matchesType = true;
    if (fileTypeFilter) {
      matchesType = getFileType(d.originalName || d.name) === fileTypeFilter;
    }

    return matchesFolder && matchesSearch && matchesDate && matchesType;
  });

  return (
    <div className="p-8 h-full flex flex-col relative animate-fade-in">
      <div className="flex justify-between items-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-[#1a3622]">إدارة الوثائق والملفات</h1>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            تصدير Excel
          </button>
          {(userRole === 'admin' || userRole === 'diwan') && (
            <button
              onClick={handleOpenAddModal}
              className="bg-[#d4af37] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-600 transition-colors"
            >
              <Plus size={20} />
              إضافة مستند
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        {/* Sidebar Folders */}
        <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col shrink-0">
          <h2 className="font-bold text-gray-700 mb-4 px-2">المجلدات</h2>
          <ul className="space-y-1 overflow-y-auto">
            <li>
              <button
                onClick={() => setCurrentFolder('')}
                className={`w-full text-right px-3 py-2 rounded-lg flex items-center gap-2 ${
                  currentFolder === '' ? 'bg-[#1a3622] text-white' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Folder size={18} className={currentFolder === '' ? 'text-[#d4af37]' : 'text-gray-400'} />
                الكل
              </button>
            </li>
            {folders.map(folder => (
              <li key={folder}>
                <button
                  onClick={() => setCurrentFolder(folder)}
                  className={`w-full text-right px-3 py-2 rounded-lg flex items-center gap-2 ${
                    currentFolder === folder ? 'bg-[#1a3622] text-white' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Folder size={18} className={currentFolder === folder ? 'text-[#d4af37]' : 'text-gray-400'} />
                  {folder}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col min-w-0">
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="بحث في الوثائق..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${showFilters ? 'bg-[#1a3622] text-white border-[#1a3622]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              <Filter size={20} />
              تصفية
            </button>
          </div>

          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                <input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                <input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الملف</label>
                <select 
                  value={fileTypeFilter}
                  onChange={(e) => setFileTypeFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622]"
                >
                  <option value="">الكل</option>
                  <option value="pdf">PDF</option>
                  <option value="image">صور</option>
                  <option value="word">Word</option>
                  <option value="excel">Excel</option>
                  <option value="text">نصوص</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button 
                  onClick={() => { setDateFrom(''); setDateTo(''); setFileTypeFilter(''); }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  مسح التصفية
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 flex items-start gap-3 hover:shadow-md transition-shadow group">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <File size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate" title={doc.name}>{doc.name}</h3>
                    {doc.documentNumber && (
                      <p className="text-sm font-bold text-[#1a3622] mt-1">
                        رقم {doc.folder}: {doc.documentNumber}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{new Date(doc.uploadDate).toLocaleDateString('ar-SY')}</p>
                    <p className="text-xs text-gray-400 mt-1">{Math.round(doc.size / 1024)} KB</p>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(userRole === 'admin' || userRole === 'diwan') && (
                      <button onClick={() => handleConvertToTask(doc)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded" title="تحويل لمهمة">
                        <CheckSquare size={16} />
                      </button>
                    )}
                    <button onClick={() => printActualDocument(doc)} className="p-1 text-gray-600 hover:bg-gray-100 rounded" title="طباعة المستند">
                      <Printer size={16} />
                    </button>
                    <button onClick={() => setPrintDoc(doc)} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="بطاقة تعريف المستند">
                      <FileText size={16} />
                    </button>
                    <button onClick={() => setPreviewDoc(doc)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="معاينة">
                      <Eye size={16} />
                    </button>
                    <a href={doc.path} target="_blank" rel="noreferrer" className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="تحميل">
                      <Download size={16} />
                    </a>
                    {userRole === 'admin' && (
                      <button onClick={() => handleDelete(doc.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="حذف">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filteredDocs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Folder size={48} className="mb-4 opacity-50" />
                <p>المجلد فارغ</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg truncate pr-8">{previewDoc.name}</h3>
              <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-gray-50 overflow-auto flex items-center justify-center p-4 relative">
              <FileViewer 
                url={previewDoc.path} 
                type={getFileType(previewDoc.originalName || previewDoc.name)} 
                name={previewDoc.name} 
              />
              {getFileType(previewDoc.originalName || previewDoc.name) === 'other' && (
                <div className="text-center flex flex-col items-center mt-4">
                  <a href={previewDoc.path} target="_blank" rel="noreferrer" className="bg-[#1a3622] text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors flex items-center gap-2">
                    <Download size={20} />
                    تحميل الملف
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1a3622]">إضافة مستند جديد</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المجلد *</label>
                  <select 
                    required
                    value={formData.folder || ''} 
                    onChange={e => handleFolderChange(e.target.value)} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]"
                  >
                    {folders.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                
                {(formData.folder === 'الصادر' || formData.folder === 'الوارد') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.folder === 'الصادر' ? 'رقم الصادر' : 'رقم الوارد'} *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.documentNumber || ''} 
                        onChange={e => setFormData({...formData, documentNumber: e.target.value})} 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622] bg-gray-50" 
                        readOnly={formData.folder === 'الصادر'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.folder === 'الصادر' ? 'تاريخ الصادر' : 'تاريخ الوارد'} *
                      </label>
                      <input 
                        type="date" 
                        required
                        value={formData.documentDate || ''} 
                        onChange={e => setFormData({...formData, documentDate: e.target.value})} 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اسم الموثق *</label>
                      <select 
                        required
                        value={formData.documenterName || ''} 
                        onChange={e => setFormData({...formData, documenterName: e.target.value})} 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]"
                      >
                        <option value="الديوان">الديوان</option>
                        <option value="رئيس المجلس">رئيس المجلس</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.folder === 'الصادر' ? 'الجهة المرسل إليها' : 'الجهة المرسلة'}
                      </label>
                      <input 
                        type="text" 
                        value={formData.senderReceiver || ''} 
                        onChange={e => setFormData({...formData, senderReceiver: e.target.value})} 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" 
                      />
                    </div>
                  </>
                )}
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموضوع / العنوان *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject || ''} 
                    onChange={e => setFormData({...formData, subject: e.target.value})} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">الملف المرفق *</label>
                  <input 
                    type="file" 
                    required
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a3622]" 
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" disabled={isSubmitting}>إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-[#1a3622] text-white rounded-lg hover:bg-[#2a4a32] disabled:opacity-50" disabled={isSubmitting}>
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 print:hidden">
              <h2 className="text-xl font-bold text-[#1a3622]">طباعة بطاقة المستند</h2>
              <div className="flex gap-2">
                <button onClick={executePrint} className="px-4 py-2 bg-[#1a3622] text-white rounded-lg hover:bg-[#2a4a32] flex items-center gap-2">
                  <Printer size={20} />
                  طباعة
                </button>
                <button onClick={() => setPrintDoc(null)} className="text-gray-400 hover:text-gray-600 p-2">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-8 print:p-0 bg-white" id="printable-document-card">
              <style type="text/css" media="print">
                {`
                  @page { size: A4 portrait; margin: 20mm; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  #printable-document-card { width: 100%; }
                  .print\\:hidden { display: none !important; }
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
                  .content-wrapper { position: relative; z-index: 1; }
                `}
              </style>
              
              <div className="relative min-h-[800px] border-2 border-gray-800 p-8 rounded-xl">
                <img src={settings?.logoPath || SYRIAN_EAGLE_LOGO} alt="Watermark" className="watermark" />
                
                <div className="content-wrapper h-full flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                    <div className="text-right">
                      <h2 className="text-xl font-bold text-gray-900">{settings?.headerLine1 || 'الجمهورية العربية السورية'}</h2>
                      <h3 className="text-lg text-gray-800 mt-1">{settings?.headerLine2 || 'محافظة دير الزور - ناحية البصيرة'}</h3>
                      <h4 className="text-md text-gray-700 mt-1">{settings?.headerLine3 || 'مجلس بلدية طيب الفال'}</h4>
                    </div>
                    <img src={settings?.logoPath || SYRIAN_EAGLE_LOGO} alt="Logo" className="w-24 h-24 object-contain" />
                  </div>

                  {/* Document Details */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-center mb-10 underline underline-offset-8">
                      بطاقة {printDoc.folder === 'الصادر' ? 'صادر' : printDoc.folder === 'الوارد' ? 'وارد' : 'مستند'}
                    </h1>
                    
                    <div className="grid grid-cols-2 gap-y-8 gap-x-12 text-lg">
                      <div className="col-span-2">
                        <span className="font-bold text-gray-600 w-32 inline-block">الموضوع:</span>
                        <span className="font-bold text-xl">{printDoc.name}</span>
                      </div>
                      
                      {(printDoc.folder === 'الصادر' || printDoc.folder === 'الوارد') && (
                        <>
                          <div>
                            <span className="font-bold text-gray-600 w-32 inline-block">رقم {printDoc.folder}:</span>
                            <span className="font-bold">{printDoc.documentNumber || '---'}</span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-600 w-32 inline-block">تاريخ {printDoc.folder}:</span>
                            <span className="font-bold">{printDoc.documentDate || '---'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-bold text-gray-600 w-32 inline-block">
                              {printDoc.folder === 'الصادر' ? 'الجهة المرسل إليها:' : 'الجهة المرسلة:'}
                            </span>
                            <span className="font-bold">{printDoc.senderReceiver || '---'}</span>
                          </div>
                        </>
                      )}
                      
                      <div>
                        <span className="font-bold text-gray-600 w-32 inline-block">المجلد:</span>
                        <span className="font-bold">{printDoc.folder}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-600 w-32 inline-block">تاريخ التسجيل:</span>
                        <span className="font-bold">{new Date(printDoc.uploadDate).toLocaleDateString('ar-SY')}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-600 w-32 inline-block">الموثق:</span>
                        <span className="font-bold">{printDoc.documenterName || '---'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Barcode */}
                  <div className="mt-auto pt-8 border-t-2 border-gray-800 flex justify-between items-end">
                    <div className="text-sm text-gray-600">
                      <p>تاريخ الطباعة: {new Date().toLocaleDateString('ar-SY')}</p>
                      <p>النظام الإلكتروني لإدارة البلدية</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <QRCodeSVG 
                        value={`رقم: ${printDoc.documentNumber || 'N/A'}\nتاريخ: ${printDoc.documentDate || 'N/A'}\nتسجيل: ${new Date(printDoc.uploadDate).toLocaleDateString('ar-SY')}\nالموثق: ${printDoc.documenterName || 'N/A'}`}
                        size={100}
                        level="M"
                        includeMargin={true}
                      />
                      <span className="text-xs text-gray-500 mt-2">رمز التحقق</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-slide-up">
            <h3 className="text-xl font-bold text-red-600 mb-4">تأكيد الحذف</h3>
            <p className="text-gray-700 mb-6">هل أنت متأكد من حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Task Modal */}
      {taskDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-[#1a3622] mb-6 flex items-center gap-2">
              <CheckSquare className="text-[#d4af37]" />
              تحويل الوثيقة لمهمة عمل
            </h2>
            <form onSubmit={submitTask} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">عنوان المهمة</label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={taskFormData.description}
                  onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">المسؤول</label>
                  <select
                    required
                    value={taskFormData.assignedTo}
                    onChange={e => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  >
                    <option value="">اختر المسؤول...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الموعد النهائي</label>
                  <input
                    type="date"
                    required
                    value={taskFormData.deadline}
                    onChange={e => setTaskFormData({ ...taskFormData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-[#1a3622] text-white px-4 py-3 rounded-xl hover:bg-[#2a4a32] transition-all font-bold shadow-lg"
                >
                  إنشاء المهمة
                </button>
                <button
                  type="button"
                  onClick={() => setTaskDoc(null)}
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
