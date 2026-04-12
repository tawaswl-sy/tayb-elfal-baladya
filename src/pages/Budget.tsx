import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Edit, Trash2, Search, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Printer } from 'lucide-react';

export default function Budget() {
  const [budget, setBudget] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    allocated: '',
    spent: '0',
    year: new Date().getFullYear().toString(),
    category: 'تشغيلي'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/budget');
      if (res.ok) setBudget(await res.json());
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/budget/${editingId}` : '/api/budget';
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
    if (!confirm('هل أنت متأكد من حذف هذا البند؟')) return;
    const res = await fetch(`/api/budget/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      allocated: '',
      spent: '0',
      year: new Date().getFullYear().toString(),
      category: 'تشغيلي'
    });
  };

  const filteredBudget = budget.filter(b => 
    b.title.includes(search) || 
    b.category.includes(search)
  );

  const totalAllocated = filteredBudget.reduce((sum, b) => sum + Number(b.allocated), 0);
  const totalSpent = filteredBudget.reduce((sum, b) => sum + Number(b.spent), 0);
  const totalRemaining = totalAllocated - totalSpent;

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-xl text-[#d4af37]">
            <Landmark size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">إدارة الميزانية</h1>
            <p className="text-gray-500 mt-1">متابعة المخصصات المالية والمصروفات السنوية</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const columns = ['البند', 'المخصص', 'المصروف', 'المتبقي', 'النسبة', 'التصنيف'];
              const data = filteredBudget.map(b => [
                b.title,
                Number(b.allocated).toLocaleString(),
                Number(b.spent).toLocaleString(),
                (Number(b.allocated) - Number(b.spent)).toLocaleString(),
                ((Number(b.spent) / Number(b.allocated)) * 100).toFixed(1) + '%',
                b.category
              ]);
              const printWindow = window.open('', '_blank');
              if (!printWindow) return;
              printWindow.document.write(`
                <html dir="rtl">
                  <head>
                    <title>تقرير الميزانية</title>
                    <style>
                      body { font-family: Arial; padding: 20px; }
                      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                      th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
                      th { bg-color: #f4f4f4; }
                      .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a3622; padding-bottom: 10px; }
                      .summary { display: flex; justify-content: space-around; margin-bottom: 30px; font-weight: bold; }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <h1>تقرير ميزانية البلدية - ${new Date().getFullYear()}</h1>
                    </div>
                    <div class="summary">
                      <div>إجمالي المخصص: ${totalAllocated.toLocaleString()}</div>
                      <div>إجمالي المصروف: ${totalSpent.toLocaleString()}</div>
                      <div>المتبقي: ${totalRemaining.toLocaleString()}</div>
                    </div>
                    <table>
                      <thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
                      <tbody>${data.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
                    </table>
                    <script>window.print();</script>
                  </body>
                </html>
              `);
              printWindow.document.close();
            }}
            className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm font-bold"
          >
            <Printer size={20} />
            طباعة التقرير
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-[#d4af37] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-yellow-600 transition-all shadow-lg font-bold"
          >
            <Plus size={20} />
            إضافة بند ميزانية
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">إجمالي المخصص</p>
            <p className="text-3xl font-black text-gray-900">{totalAllocated.toLocaleString()} <span className="text-sm text-gray-400">ل.س</span></p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center shadow-inner">
            <TrendingDown size={32} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">إجمالي المصروف</p>
            <p className="text-3xl font-black text-rose-600">{totalSpent.toLocaleString()} <span className="text-sm text-gray-400">ل.س</span></p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">المتبقي</p>
            <p className="text-3xl font-black text-emerald-600">{totalRemaining.toLocaleString()} <span className="text-sm text-gray-400">ل.س</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
        <div className="relative max-w-md mb-8">
          <input
            type="text"
            placeholder="بحث عن بند ميزانية..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBudget.map(item => {
            const percent = (Number(item.spent) / Number(item.allocated)) * 100;
            const isOver = percent > 100;
            
            return (
              <div key={item.id} className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-6 group hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                      {item.category}
                    </span>
                    <h3 className="text-xl font-black text-gray-900">{item.title}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setFormData(item);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-400">المصروف: <span className="text-gray-900">{Number(item.spent).toLocaleString()}</span></span>
                    <span className="text-gray-400">المخصص: <span className="text-gray-900">{Number(item.allocated).toLocaleString()}</span></span>
                  </div>
                  
                  <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isOver ? 'bg-red-500' : percent > 80 ? 'bg-yellow-500' : 'bg-[#1a3622]'}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-black ${isOver ? 'text-red-600' : 'text-gray-400'}`}>
                      {percent.toFixed(1)}% من الميزانية
                    </span>
                    {isOver && (
                      <div className="flex items-center gap-1 text-red-600 font-black text-xs animate-pulse">
                        <AlertTriangle size={14} />
                        <span>تجاوز الميزانية!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredBudget.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Landmark size={40} />
            </div>
            <p className="text-gray-400 font-bold italic">لا توجد بنود ميزانية مسجلة</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-[#1a3622] mb-6">
              {editingId ? 'تعديل بند الميزانية' : 'إضافة بند ميزانية جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم البند</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  placeholder="مثال: صيانة الطرق"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">المبلغ المخصص</label>
                  <input
                    type="number"
                    required
                    value={formData.allocated}
                    onChange={e => setFormData({ ...formData, allocated: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">المبلغ المصروف</label>
                  <input
                    type="number"
                    required
                    value={formData.spent}
                    onChange={e => setFormData({ ...formData, spent: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">التصنيف</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  >
                    <option value="تشغيلي">تشغيلي</option>
                    <option value="استثماري">استثماري</option>
                    <option value="رواتب">رواتب</option>
                    <option value="صيانة">صيانة</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-[#1a3622] text-white px-4 py-3 rounded-xl hover:bg-[#2a4a32] transition-all font-bold shadow-lg"
                >
                  حفظ البند
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
