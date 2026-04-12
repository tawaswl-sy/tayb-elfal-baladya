import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Phone, Mail, MapPin, Briefcase, Calendar, Award, Heart, ShieldCheck } from 'lucide-react';
import { SYRIAN_EAGLE_LOGO } from '../lib/logo';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
    fetchEmployeeDetails();
  }, [id]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) setSettings(await res.json());
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const res = await fetch('/api/employees');
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      const emp = data.find((e: any) => e.id === id || e.employeeId === id);
      setEmployee(emp);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  if (!employee) {
    return (
      <div className="p-8 text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-red-600 mb-4">الموظف غير موجود</h2>
        <button onClick={() => navigate('/employees')} className="text-[#1a3622] hover:underline flex items-center justify-center gap-2 mx-auto">
          <ArrowRight size={20} />
          العودة لقائمة الموظفين
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
      <button onClick={() => navigate('/employees')} className="mb-6 text-[#1a3622] hover:underline flex items-center gap-2">
        <ArrowRight size={20} />
        العودة لقائمة الموظفين
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden mb-8">
        <div className="bg-[#1a3622] p-8 text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            {employee.photoPath ? (
              <img src={employee.photoPath} alt={employee.name} className="w-40 h-40 object-cover rounded-[2rem] border-4 border-white/20 shadow-2xl" />
            ) : (
              <div className="w-40 h-40 bg-white/10 rounded-[2rem] flex items-center justify-center border-4 border-white/20 shadow-2xl">
                <Users size={64} className="text-white/50" />
              </div>
            )}
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-[#1a3622] ${employee.serviceStatus === 'في الخدمة' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>

          <div className="text-center md:text-right flex-1 relative z-10">
            <h1 className="text-4xl font-black mb-2 tracking-tight">{employee.name}</h1>
            <p className="text-[#d4af37] text-xl font-bold mb-4">{employee.jobTitle}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/10 text-sm font-bold">{employee.department}</span>
              <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/10 text-sm font-bold">رقم وظيفي: {employee.employeeId}</span>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-xl font-black text-[#1a3622] flex items-center gap-3 border-b-2 border-gray-50 pb-3">
              <Briefcase size={24} className="text-[#d4af37]" />
              المعلومات الوظيفية
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <InfoItem label="المسمى الوظيفي" value={employee.jobTitle} />
              <InfoItem label="القسم" value={employee.department} />
              <InfoItem label="المؤهل العلمي" value={employee.education} />
              <InfoItem label="الفئة / المرتبة" value={employee.category} />
              <InfoItem label="تاريخ المباشرة" value={employee.hireDate} />
              <InfoItem label="حالة الخدمة" value={employee.serviceStatus} />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-[#1a3622] flex items-center gap-3 border-b-2 border-gray-50 pb-3">
              <ShieldCheck size={24} className="text-[#d4af37]" />
              المعلومات الشخصية
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <InfoItem label="الرقم الوطني" value={employee.nationalId} />
              <InfoItem label="اسم الأم" value={employee.motherName} />
              <InfoItem label="تاريخ الميلاد" value={employee.dob} />
              <InfoItem label="مكان الولادة" value={employee.pob} />
              <InfoItem label="الوضع العائلي" value={employee.maritalStatus} />
              <InfoItem label="عدد الأولاد" value={employee.childrenCount} />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-[#1a3622] flex items-center gap-3 border-b-2 border-gray-50 pb-3">
              <Phone size={24} className="text-[#d4af37]" />
              معلومات التواصل
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <InfoItem label="رقم الهاتف" value={employee.phone} isLtr />
              <InfoItem label="رقم الطوارئ" value={employee.emergencyContact} isLtr />
              <InfoItem label="العنوان" value={employee.address} />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-[#1a3622] flex items-center gap-3 border-b-2 border-gray-50 pb-3">
              <Heart size={24} className="text-[#d4af37]" />
              معلومات إضافية
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <InfoItem label="زمرة الدم" value={employee.bloodType} isLtr />
              <InfoItem label="الديانة" value={employee.religion} />
              <InfoItem label="الجنسية" value={employee.nationality} />
            </div>
          </div>
        </div>

        {employee.notes && (
          <div className="p-8 bg-gray-50 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">ملاحظات إضافية</h3>
            <p className="text-gray-600 leading-relaxed">{employee.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value, isLtr = false }: { label: string, value: string, isLtr?: boolean }) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
      <span className="text-gray-500 font-bold text-sm">{label}</span>
      <span className={`font-black text-gray-900 ${isLtr ? 'dir-ltr' : ''}`}>{value || '-'}</span>
    </div>
  );
}
