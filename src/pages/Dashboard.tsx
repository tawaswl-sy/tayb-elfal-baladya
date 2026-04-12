import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, Truck, FolderOpen, Building2, Activity as ActivityIcon, 
  Clock, Briefcase, MessageSquare, FileSignature, Map as MapIcon, 
  Database, Shield, Home, School, ArrowRight, PieChart as LucidePieChart,
  CheckSquare, Gavel, Landmark, AlertTriangle, Calendar, FileText, Plus,
  HeartHandshake
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ headerLine3: 'البلدية' });
  const [stats, setStats] = useState({
    employeesCount: 0,
    activeEmployeesCount: 0,
    machineryCount: 0,
    documentsCount: 0,
    projectsCount: 0,
    complaintsCount: 0,
    licensesCount: 0,
    departmentsCount: 0,
    employeesByDept: [],
    machineryByStatus: [],
    projectsByStatus: [],
    complaintsByStatus: [],
    recentActivities: [],
    databank: {
      totalPopulation: 0,
      neighborhoodsCount: 0,
      schoolsCount: 0,
      studentsCount: 0,
      facilitiesCount: 0,
      propertiesCount: 0,
      socialSupportCount: 0,
      socialSupportByCategory: []
    },
    morningReport: {
      yesterdayIncoming: 0,
      yesterdayOutgoing: 0,
      machineryInMaintenance: 0,
      overdueTasks: 0
    }
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const userRole = localStorage.getItem('userRole') || 'viewer';

  useEffect(() => {
    // Fetch Dashboard Stats
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching dashboard stats:', err));

    // Fetch Notifications
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error('Error fetching notifications:', err));

    // Fetch Settings for Municipality Name
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const cards = [
    { title: 'المهام والمتابعة', value: stats.morningReport?.overdueTasks || 0, icon: CheckSquare, color: 'bg-indigo-600', path: '/tasks', roles: ['admin', 'diwan', 'employee'] },
    { title: 'أرشيف القرارات', value: 'عرض', icon: Gavel, color: 'bg-slate-700', path: '/decisions', roles: ['admin', 'diwan'] },
    { title: 'الميزانية', value: 'إدارة', icon: Landmark, color: 'bg-amber-600', path: '/budget', roles: ['admin', 'accountant'] },
    { title: 'إجمالي الموظفين', value: stats.employeesCount, icon: Users, color: 'bg-blue-600', path: '/employees', roles: ['admin', 'accountant'] },
    { title: 'الآليات والمعدات', value: stats.machineryCount, icon: Truck, color: 'bg-orange-600', path: '/machinery', roles: ['admin', 'employee'] },
    { title: 'الأرشيف والوثائق', value: stats.documentsCount, icon: FolderOpen, color: 'bg-indigo-600', path: '/documents', roles: ['admin', 'diwan', 'accountant'] },
    { title: 'المشاريع التنموية', value: stats.projectsCount, icon: Briefcase, color: 'bg-emerald-600', path: '/projects', roles: ['admin', 'employee'] },
    { title: 'الشكاوى والمقترحات', value: stats.complaintsCount, icon: MessageSquare, color: 'bg-rose-600', path: '/complaints', roles: ['admin', 'employee'] },
    { title: 'الرخص والشهادات', value: stats.licensesCount, icon: FileSignature, color: 'bg-cyan-600', path: '/licenses', roles: ['admin', 'employee'] },
    { title: 'بنك المعلومات', value: stats.databank?.neighborhoodsCount || 0, icon: Database, color: 'bg-[#1a3622]', path: '/databank', roles: ['admin'] },
    { title: 'الدعم الاجتماعي', value: stats.databank?.socialSupportCount || 0, icon: HeartHandshake, color: 'bg-rose-600', path: '/databank/social-support', roles: ['admin'] },
    { title: 'الخريطة التفاعلية', value: 'عرض', icon: MapIcon, color: 'bg-[#d4af37]', path: '/databank/map', roles: ['admin', 'employee'] },
  ];

  const visibleCards = cards.filter(card => card.roles.includes(userRole));

  const COLORS = ['#1a3622', '#d4af37', '#2a4a32', '#c4a030', '#3a5a42', '#e4bf47'];

  return (
    <div className="p-8 animate-fade-in space-y-8 bg-[#f8fafc] min-h-screen">
      {/* Welcome Header - Compact Version */}
      <header className="relative overflow-hidden bg-[#1a3622] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-green-900/20 border border-white/5">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-black tracking-widest uppercase text-[#d4af37]">
              <ActivityIcon size={12} />
              <span>نظام الإدارة الذكي v2.0</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              أهلاً بك، <span className="text-[#d4af37]">مدير النظام</span>
            </h1>
            <p className="text-white/60 text-sm max-w-lg leading-relaxed">
              نظام الإدارة المتكامل لـ <span className="text-white font-bold">{settings.headerLine3 || 'البلدية'}</span>. تابع الأداء والبيانات في مكان واحد.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-inner">
              <div className="w-12 h-12 bg-[#d4af37] rounded-2xl flex items-center justify-center text-[#1a3622] shadow-lg">
                <Shield size={28} />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-0.5">مستوى الوصول</p>
                <p className="text-lg font-black text-white">{userRole === 'admin' ? 'مدير النظام' : 'موظف'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <button onClick={() => navigate('/documents')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Plus size={20} />
          </div>
          <span className="font-bold text-gray-700 text-sm">إضافة مستند</span>
        </button>
        <button onClick={() => navigate('/tasks')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <CheckSquare size={20} />
          </div>
          <span className="font-bold text-gray-700 text-sm">مهمة جديدة</span>
        </button>
        <button onClick={() => navigate('/meetings')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <FileText size={20} />
          </div>
          <span className="font-bold text-gray-700 text-sm">محضر اجتماع</span>
        </button>
        <button onClick={() => navigate('/complaints')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <MessageSquare size={20} />
          </div>
          <span className="font-bold text-gray-700 text-sm">تسجيل شكوى</span>
        </button>
        <button onClick={() => navigate('/databank/map')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <MapIcon size={20} />
          </div>
          <span className="font-bold text-gray-700 text-sm">فتح الخريطة</span>
        </button>
        <button onClick={() => navigate('/morning-report')} className="bg-[#d4af37] p-4 rounded-2xl border border-[#d4af37] shadow-sm hover:shadow-md transition-all flex items-center gap-3 group text-white">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-[#d4af37] transition-colors">
            <ActivityIcon size={20} />
          </div>
          <span className="font-bold text-sm">التقرير الصباحي</span>
        </button>
      </div>

      {/* Morning Report & Urgent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Morning Report Card */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 text-[#1a3622] opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <Calendar size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">تقرير الداشبورد الصباحي</h2>
                  <p className="text-sm text-gray-400 font-bold">ملخص الأداء والعمليات لليوم</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/morning-report')}
                className="bg-[#1a3622] text-white px-6 py-2 rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-transform"
              >
                توليد التقرير
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <p className="text-xs text-gray-400 font-bold mb-2">وارد أمس</p>
                <p className="text-3xl font-black text-gray-900">{stats.morningReport?.yesterdayIncoming || 0}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <p className="text-xs text-gray-400 font-bold mb-2">صادر أمس</p>
                <p className="text-3xl font-black text-gray-900">{stats.morningReport?.yesterdayOutgoing || 0}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <p className="text-xs text-gray-400 font-bold mb-2">قيد الصيانة</p>
                <p className="text-3xl font-black text-orange-600">{stats.morningReport?.machineryInMaintenance || 0}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <p className="text-xs text-gray-400 font-bold mb-2">صيانة قادمة</p>
                <p className="text-3xl font-black text-yellow-600">{stats.morningReport?.upcomingMaintenance || 0}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <p className="text-xs text-gray-400 font-bold mb-2">مهام متأخرة</p>
                <p className="text-3xl font-black text-red-600">{stats.morningReport?.overdueTasks || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Alerts Card */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">تنبيهات عاجلة</h2>
              <p className="text-sm text-gray-400 font-bold">تحتاج تدخل فوري</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
            {notifications.filter(n => n.type === 'danger' || n.type === 'warning').length > 0 ? (
              notifications.filter(n => n.type === 'danger' || n.type === 'warning').map((n, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${n.type === 'danger' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                  <p className="text-sm font-black text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <ActivityIcon size={24} />
                </div>
                <p className="text-gray-400 font-bold text-sm">لا توجد تنبيهات عاجلة</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Main Stat - Population (Large) */}
        <div className="md:col-span-2 lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 right-0 p-10 text-[#1a3622] opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <Users size={220} />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
              <Users size={32} />
            </div>
            <h3 className="text-gray-400 font-black text-sm uppercase tracking-widest mb-2">إجمالي سكان المدينة</h3>
            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-black text-gray-900 tracking-tighter">{stats.databank?.totalPopulation || 0}</span>
              <span className="text-blue-600 font-black text-lg bg-blue-50 px-4 py-1 rounded-2xl">نسمة</span>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
              <Clock size={16} />
              <span>آخر تحديث: اليوم</span>
            </div>
            <Link to="/databank/population" className="bg-blue-600 text-white px-6 py-2 rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:scale-105 transition-transform">التفاصيل</Link>
          </div>
        </div>

        {/* Neighborhoods Count */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-500">
          <div>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-12 transition-transform">
              <Home size={32} />
            </div>
            <h3 className="text-gray-400 font-black text-sm uppercase tracking-widest mb-2">الأحياء الإدارية</h3>
            <span className="text-5xl font-black text-gray-900 tracking-tighter">{stats.databank?.neighborhoodsCount || 0}</span>
          </div>
          <div className="mt-8">
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-4/5 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-400 mt-3 font-bold">تغطية جغرافية شاملة</p>
          </div>
        </div>

        {/* Schools Count */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-500">
          <div>
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:-rotate-12 transition-transform">
              <School size={32} />
            </div>
            <h3 className="text-gray-400 font-black text-sm uppercase tracking-widest mb-2">المؤسسات التعليمية</h3>
            <span className="text-5xl font-black text-gray-900 tracking-tighter">{stats.databank?.schoolsCount || 0}</span>
          </div>
          <div className="mt-8 flex items-center gap-3 text-amber-600 font-black text-sm bg-amber-50 p-3 rounded-2xl">
            <Users size={18} />
            <span>{stats.databank?.studentsCount || 0} طالب وطالبة</span>
          </div>
        </div>

        {/* Interactive Map Card - Wide */}
        <Link 
          to="/databank/map" 
          className="md:col-span-3 lg:col-span-3 bg-[#1a3622] rounded-[3.5rem] p-10 text-white shadow-2xl shadow-green-900/20 border border-white/5 flex flex-col md:flex-row items-center gap-12 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/400?blur=5')] bg-cover bg-center opacity-20 group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="relative z-10 shrink-0">
            <div className="w-32 h-32 bg-[#d4af37] rounded-[2.5rem] flex items-center justify-center text-[#1a3622] shadow-2xl group-hover:rotate-6 transition-transform duration-500">
              <MapIcon size={64} />
            </div>
          </div>
          <div className="relative z-10 flex-1 text-center md:text-right">
            <h2 className="text-4xl font-black mb-4 text-[#d4af37] tracking-tight">الخريطة التفاعلية GIS</h2>
            <p className="text-white/60 text-xl mb-8 leading-relaxed max-w-2xl">نظام المعلومات الجغرافي المتطور لاستكشاف المرافق، الأراضي، والحدود التنظيمية بدقة عالية.</p>
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 font-black text-lg group-hover:bg-[#d4af37] group-hover:text-[#1a3622] transition-all duration-500">
              <span>فتح النظام الجغرافي</span>
              <ArrowRight size={24} className="rtl:rotate-180" />
            </div>
          </div>
        </Link>

        {/* Facilities Count */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center group hover:shadow-2xl transition-all duration-500">
          <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Building2 size={40} />
          </div>
          <h3 className="text-gray-400 font-black text-sm uppercase tracking-widest mb-2">المرافق العامة</h3>
          <span className="text-5xl font-black text-gray-900 tracking-tighter">{stats.databank?.facilitiesCount || 0}</span>
        </div>

        {/* Social Support Count */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center group hover:shadow-2xl transition-all duration-500">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
            <HeartHandshake size={40} />
          </div>
          <h3 className="text-gray-400 font-black text-sm uppercase tracking-widest mb-2">حالات الدعم</h3>
          <span className="text-5xl font-black text-gray-900 tracking-tighter">{stats.databank?.socialSupportCount || 0}</span>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {visibleCards.filter(c => !['بنك المعلومات', 'الخريطة التفاعلية'].includes(c.title)).map((card, i) => (
          <button
            key={i}
            onClick={() => navigate(card.path)}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-4 group"
          >
            <div className={`w-12 h-12 rounded-2xl ${card.color} text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
              <card.icon size={24} />
            </div>
            <span className="font-black text-gray-700 text-sm text-center">{card.title}</span>
          </button>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <LucidePieChart size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">توزيع الموظفين</h2>
                <p className="text-sm text-gray-400 font-bold">حسب الأقسام الإدارية</p>
              </div>
            </div>
          </div>
          <div className="h-96">
            {stats.employeesByDept.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.employeesByDept}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={140}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {stats.employeesByDept.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300 font-black italic text-lg">لا توجد بيانات متاحة</div>
            )}
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Briefcase size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">حالة المشاريع</h2>
                <p className="text-sm text-gray-400 font-bold">المشاريع التنموية الحالية</p>
              </div>
            </div>
          </div>
          <div className="h-96">
            {stats.projectsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.projectsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: '900', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: '900', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px' }}
                  />
                  <Bar dataKey="value" fill="#d4af37" radius={[15, 15, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300 font-black italic text-lg">لا توجد مشاريع مسجلة</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">آخر النشاطات</h2>
              <p className="text-sm text-gray-400 font-bold">مراقبة العمليات في النظام</p>
            </div>
          </div>
          <button className="bg-gray-50 text-gray-600 px-6 py-2 rounded-2xl font-black text-sm hover:bg-gray-100 transition-colors">عرض السجل الكامل</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.slice(0, 6).map((activity: any, index) => (
              <div key={index} className="group p-6 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-[#1a3622] group-hover:bg-[#1a3622] group-hover:text-white transition-colors duration-500">
                    <Clock size={20} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="font-black text-gray-800 leading-snug group-hover:text-[#1a3622] transition-colors">{activity.details}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#d4af37] rounded-full flex items-center justify-center text-[10px] text-[#1a3622] font-black">
                          {activity.user[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-black text-gray-500">{activity.user}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
                        {new Date(activity.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <ActivityIcon size={40} />
              </div>
              <p className="text-gray-400 font-black italic">لا توجد نشاطات مسجلة حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
