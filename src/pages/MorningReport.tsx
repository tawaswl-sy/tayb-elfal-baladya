import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SYRIAN_EAGLE_LOGO } from '../lib/logo';
import { Printer, ArrowRight, FileText, Truck, CheckSquare, AlertTriangle, Landmark, HeartHandshake } from 'lucide-react';

export default function MorningReport() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, settingsRes, notificationsRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/settings'),
          fetch('/api/notifications')
        ]);

        const stats = await statsRes.json();
        const settings = await settingsRes.json();
        const notifications = await notificationsRes.json();

        setData({
          ...stats,
          urgentAlerts: notifications.filter((n: any) => n.type === 'danger' || n.type === 'warning')
        });
        setSettings(settings);
      } catch (error) {
        console.error('Error fetching morning report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">جاري تجهيز التقرير...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 dir-rtl">
      <div className="max-w-4xl mx-auto">
        {/* Actions Bar - Hidden on Print */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#1a3622] hover:underline font-bold">
            <ArrowRight size={20} />
            العودة للوحة التحكم
          </button>
          <button 
            onClick={() => window.print()} 
            className="bg-[#1a3622] text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-transform font-bold"
          >
            <Printer size={20} />
            طباعة التقرير
          </button>
        </div>

        {/* Report Content */}
        <div className="bg-white p-12 shadow-xl rounded-[2rem] border border-gray-100 print:shadow-none print:border-none print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-12 border-b-2 border-[#1a3622] pb-8">
            <div className="text-right space-y-1">
              <p className="font-bold text-gray-900">{settings.headerLine1 || 'الجمهورية العربية السورية'}</p>
              <p className="font-bold text-gray-700">{settings.headerLine2 || 'محافظة دير الزور'}</p>
              <p className="font-black text-[#1a3622] text-xl">{settings.headerLine3 || 'مجلس البلدية'}</p>
            </div>
            <img src={settings.logoPath || SYRIAN_EAGLE_LOGO} alt="Logo" className="w-24 h-24 object-contain" />
            <div className="text-left space-y-1">
              <p className="font-bold text-gray-900">التاريخ: {new Date().toLocaleDateString('ar-SY')}</p>
              <p className="font-bold text-gray-700">الوقت: {new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="font-bold text-gray-500">الرقم: {Math.floor(Math.random() * 10000)}/م.ص</p>
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-[#1a3622] underline underline-offset-8 decoration-[#d4af37]">التقرير الصباحي اليومي</h1>
            <p className="text-gray-500 mt-4 font-bold">ملخص شامل لحالة العمليات والآليات والمهام</p>
          </div>

          {/* Section 1: Documents */}
          <section className="mb-10">
            <h2 className="text-xl font-black text-[#1a3622] flex items-center gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
              <FileText size={24} className="text-[#d4af37]" />
              حركة المراسلات (يوم أمس)
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-200 p-6 rounded-2xl text-center">
                <p className="text-gray-500 font-bold mb-1">البريد الوارد</p>
                <p className="text-4xl font-black text-blue-600">{data.morningReport?.yesterdayIncoming || 0}</p>
              </div>
              <div className="border-2 border-dashed border-gray-200 p-6 rounded-2xl text-center">
                <p className="text-gray-500 font-bold mb-1">البريد الصادر</p>
                <p className="text-4xl font-black text-emerald-600">{data.morningReport?.yesterdayOutgoing || 0}</p>
              </div>
            </div>
          </section>

          {/* Section 2: Machinery */}
          <section className="mb-10">
            <h2 className="text-xl font-black text-[#1a3622] flex items-center gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
              <Truck size={24} className="text-[#d4af37]" />
              حالة الآليات والمعدات
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                <p className="text-green-800 font-bold text-sm">جاهزة للعمل</p>
                <p className="text-2xl font-black text-green-900">{data.machineryCount - data.morningReport?.machineryInMaintenance}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                <p className="text-orange-800 font-bold text-sm">قيد الصيانة</p>
                <p className="text-2xl font-black text-orange-900">{data.morningReport?.machineryInMaintenance || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 text-center">
                <p className="text-yellow-800 font-bold text-sm">صيانة قادمة (أسبوع)</p>
                <p className="text-2xl font-black text-yellow-900">{data.morningReport?.upcomingMaintenance || 0}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                <p className="text-blue-800 font-bold text-sm">إجمالي الأسطول</p>
                <p className="text-2xl font-black text-blue-900">{data.machineryCount}</p>
              </div>
            </div>
          </section>

          {/* Section 3: Tasks */}
          <section className="mb-10">
            <h2 className="text-xl font-black text-[#1a3622] flex items-center gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
              <CheckSquare size={24} className="text-[#d4af37]" />
              متابعة المهام والتنفيذ
            </h2>
            <div className="border-2 border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 font-bold text-gray-700">الحالة</th>
                    <th className="p-3 font-bold text-gray-700">العدد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 text-red-600 font-bold">مهام متأخرة (تجاوزت الموعد)</td>
                    <td className="p-3 font-black text-lg">{data.morningReport?.overdueTasks || 0}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700 font-bold">إجمالي المهام المفتوحة</td>
                    <td className="p-3 font-black text-lg">{data.documentsCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Social Support Summary */}
          <section className="mb-10">
            <h2 className="text-xl font-black text-[#1a3622] flex items-center gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
              <HeartHandshake size={24} className="text-[#d4af37]" />
              ملخص الحالات الاجتماعية (بنك المعلومات)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border-2 border-gray-100 rounded-2xl text-center">
                <p className="text-gray-500 font-bold text-xs mb-1">إجمالي الحالات</p>
                <p className="text-2xl font-black text-[#1a3622]">{data.databank?.socialSupportCount || 0}</p>
              </div>
              {data.databank?.socialSupportByCategory?.slice(0, 3).map((cat: any, idx: number) => (
                <div key={idx} className="p-4 border-2 border-gray-100 rounded-2xl text-center">
                  <p className="text-gray-500 font-bold text-xs mb-1">{cat.name}</p>
                  <p className="text-2xl font-black text-[#1a3622]">{cat.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Urgent Alerts */}
          <section className="mb-10">
            <h2 className="text-xl font-black text-[#1a3622] flex items-center gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
              <AlertTriangle size={24} className="text-[#d4af37]" />
              التنبيهات العاجلة والمخاطر
            </h2>
            {data.urgentAlerts && data.urgentAlerts.length > 0 ? (
              <div className="space-y-3">
                {data.urgentAlerts.map((n: any, i: number) => (
                  <div key={i} className={`p-4 rounded-xl border-2 ${n.type === 'danger' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-yellow-50 border-yellow-200 text-yellow-900'}`}>
                    <p className="font-black underline mb-1">{n.title}</p>
                    <p className="text-sm font-bold">{n.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-400 font-bold italic border-2 border-dashed border-gray-100 rounded-2xl">لا توجد تنبيهات عاجلة لهذا اليوم</p>
            )}
          </section>

          {/* Footer / Signatures */}
          <div className="mt-20 grid grid-cols-2 gap-20">
            <div className="text-center space-y-12">
              <p className="font-bold text-gray-900">أمين السر / الديوان</p>
              <div className="border-b border-gray-300 w-48 mx-auto"></div>
              <p className="text-sm text-gray-400">التوقيع والختم</p>
            </div>
            <div className="text-center space-y-12">
              <p className="font-bold text-gray-900">رئيس مجلس البلدية</p>
              <div className="border-b border-gray-300 w-48 mx-auto"></div>
              <p className="text-sm text-gray-400">التوقيع والختم</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400 text-xs print:hidden">
          <p>تم توليد هذا التقرير آلياً بواسطة نظام إدارة البلدية الذكي</p>
        </div>
      </div>
    </div>
  );
}
