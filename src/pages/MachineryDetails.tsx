import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, ArrowRight, Wrench, Calendar, Shield, Info } from 'lucide-react';
import { SYRIAN_EAGLE_LOGO } from '../lib/logo';

export default function MachineryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machinery, setMachinery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
    fetchMachineryDetails();
  }, [id]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchMachineryDetails = async () => {
    try {
      const res = await fetch('/api/machinery');
      const data = await res.json();
      // Find by ID or plate number
      const machine = data.find((m: any) => m.id === id || m.plateNumber === id);
      setMachinery(machine);
    } catch (error) {
      console.error('Error fetching machinery details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">جاري التحميل...</div>;
  }

  if (!machinery) {
    return (
      <div className="p-8 text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-red-600 mb-4">الآلية غير موجودة</h2>
        <button onClick={() => navigate('/machinery')} className="text-[#1a3622] hover:underline flex items-center justify-center gap-2 mx-auto">
          <ArrowRight size={20} />
          العودة لقائمة الآليات
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
      <button onClick={() => navigate('/machinery')} className="mb-6 text-[#1a3622] hover:underline flex items-center gap-2">
        <ArrowRight size={20} />
        العودة لقائمة الآليات
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="bg-[#1a3622] p-6 text-white flex flex-col md:flex-row items-center gap-6">
          {machinery.photoPath ? (
            <img src={machinery.photoPath} alt={machinery.name} className="w-32 h-32 object-cover rounded-xl border-4 border-white/20 shadow-lg" />
          ) : (
            <div className="w-32 h-32 bg-white/10 rounded-xl flex items-center justify-center border-4 border-white/20 shadow-lg">
              <Truck size={48} className="text-white/50" />
            </div>
          )}
          <div className="text-center md:text-right flex-1">
            <h1 className="text-3xl font-bold mb-2">{machinery.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">{machinery.type}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">{machinery.modelYear}</span>
              <span className="bg-[#d4af37] text-[#1a3622] font-bold px-3 py-1 rounded-full">{machinery.plateNumber || 'بدون لوحة'}</span>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
              <Info size={20} className="text-[#1a3622]" />
              المعلومات الفنية
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">رقم الشاسيه</span>
                <span className="font-medium text-gray-900">{machinery.chassisNumber || '-'}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">رقم المحرك</span>
                <span className="font-medium text-gray-900">{machinery.engineNumber || '-'}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">الحالة الفنية</span>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${machinery.status === 'تعمل' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {machinery.status || 'غير محدد'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">السائق الحالي</span>
                <span className="font-medium text-gray-900">{machinery.driverName || '-'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
              <Shield size={20} className="text-[#1a3622]" />
              المواعيد والتأمين
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">تاريخ الصيانة القادمة</span>
                <span className="font-medium text-gray-900">{machinery.nextMaintenance || '-'}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">انتهاء التأمين/الترسيم</span>
                <span className="font-medium text-gray-900">{machinery.insuranceExpiry || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-[#1a3622] flex items-center gap-2">
            <Wrench size={24} />
            سجل الصيانة
          </h2>
        </div>
        <div className="p-6">
          {machinery.maintenanceLog && machinery.maintenanceLog.length > 0 ? (
            <div className="space-y-6">
              {machinery.maintenanceLog.map((log: any, index: number) => (
                <div key={index} className="relative pl-6 md:pl-0 md:pr-6 border-r-2 border-[#d4af37]">
                  <div className="absolute top-0 right-[-9px] w-4 h-4 bg-[#1a3622] rounded-full border-4 border-white"></div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 gap-2">
                      <h4 className="font-bold text-lg text-[#1a3622]">{log.type}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                        <Calendar size={14} />
                        {new Date(log.date).toLocaleDateString('ar-SY')}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-3">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">التكلفة: {log.cost || 0} ل.س</span>
                    </div>
                    {log.notes && (
                      <p className="text-gray-600 text-sm bg-white p-3 rounded-lg border border-gray-100">{log.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Wrench size={48} className="mx-auto mb-4 opacity-20" />
              <p>لا يوجد سجل صيانة لهذه الآلية حتى الآن</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
