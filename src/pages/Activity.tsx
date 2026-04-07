import { useState, useEffect } from 'react';
import React from 'react';
import { Activity as ActivityIcon, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Activity() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await fetch('/api/activity');
    const data = await res.json();
    setLogs(data.reverse()); // Show newest first
  };

  const filteredLogs = logs.filter(log => 
    log.action?.includes(search) || log.user?.includes(search) || log.details?.includes(search)
  );

  const exportToExcel = () => {
    const dataToExport = filteredLogs.map(log => ({
      'الوقت والتاريخ': new Date(log.timestamp).toLocaleString('ar-SA') || '-',
      'المستخدم': log.user || '-',
      'العملية': log.action || '-',
      'التفاصيل': log.details || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "سجل النشاط");
    
    // Set RTL direction for the worksheet
    if (!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ rightToLeft: true });

    XLSX.writeFile(workbook, "سجل_النشاط.xlsx");
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-[#1a3622]">سجل النشاط</h1>
        <div className="flex gap-4">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            تصدير Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="relative max-w-md mb-6">
          <input
            type="text"
            placeholder="بحث في السجل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
          />
          <ActivityIcon className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-medium">الوقت والتاريخ</th>
                <th className="p-4 font-medium">المستخدم</th>
                <th className="p-4 font-medium">العملية</th>
                <th className="p-4 font-medium">التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-500" dir="ltr">
                    {new Date(log.timestamp).toLocaleString('ar-SY')}
                  </td>
                  <td className="p-4 font-medium text-gray-900">{log.user}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">لا توجد سجلات لعرضها</div>
          )}
        </div>
      </div>
    </div>
  );
}
