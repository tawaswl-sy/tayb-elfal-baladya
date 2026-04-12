import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Edit, Trash2, Search, Clock, User, Calendar, AlertCircle } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
    status: 'معلقة'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tRes, eRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/employees')
      ]);
      if (tRes.ok) setTasks(await tRes.json());
      if (eRes.ok) setEmployees(await eRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/tasks/${editingId}` : '/api/tasks';
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
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      deadline: '',
      status: 'معلقة'
    });
  };

  const filteredTasks = tasks.filter(t => 
    t.title.includes(search) || 
    t.description.includes(search) ||
    t.assignedTo.includes(search)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'منجزة': return 'bg-green-100 text-green-800';
      case 'جارية': return 'bg-blue-100 text-blue-800';
      case 'معلقة': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-xl text-[#d4af37]">
            <CheckSquare size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">نظام المهام والمتابعة</h1>
            <p className="text-gray-500 mt-1">توزيع المهام ومتابعة سير العمل اليومي</p>
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
          إضافة مهمة جديدة
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="relative max-w-md mb-8">
          <input
            type="text"
            placeholder="بحث عن مهمة أو مسؤول..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent transition-all"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-6 hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(task.id);
                      setFormData(task);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{task.title}</h3>
              <p className="text-sm text-gray-600 mb-6 line-clamp-2">{task.description}</p>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User size={14} className="text-[#d4af37]" />
                  <span className="font-bold">المسؤول:</span>
                  <span className="text-gray-900">{task.assignedTo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} className="text-blue-500" />
                    <span className="font-bold">الموعد:</span>
                    <span className={new Date(task.deadline) < new Date() && task.status !== 'منجزة' ? 'text-red-600 font-bold' : 'text-gray-900'}>
                      {task.deadline}
                    </span>
                  </div>
                  {new Date(task.deadline) < new Date() && task.status !== 'منجزة' && (
                    <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold animate-pulse">
                      <AlertCircle size={12} />
                      <span>متأخرة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <CheckSquare size={40} />
            </div>
            <p className="text-gray-400 font-bold italic">لا توجد مهام مسجلة حالياً</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-[#1a3622] mb-6">
              {editingId ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">عنوان المهمة</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  placeholder="مثال: إصلاح إنارة شارع البصيرة"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent h-24"
                  placeholder="تفاصيل المهمة..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">المسؤول</label>
                  <select
                    required
                    value={formData.assignedTo}
                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
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
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الحالة</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
                >
                  <option value="معلقة">معلقة</option>
                  <option value="جارية">جارية</option>
                  <option value="منجزة">منجزة</option>
                </select>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-[#1a3622] text-white px-4 py-3 rounded-xl hover:bg-[#2a4a32] transition-all font-bold shadow-lg"
                >
                  حفظ المهمة
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
