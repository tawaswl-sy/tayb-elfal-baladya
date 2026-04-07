import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Truck, FolderOpen, Building2, Activity as ActivityIcon, Clock, Briefcase, MessageSquare, FileSignature } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
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
      propertiesCount: 0
    }
  });
  const userRole = localStorage.getItem('userRole') || 'viewer';

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const cards = [
    { title: 'إجمالي الموظفين', value: stats.employeesCount, icon: Users, color: 'bg-blue-500', path: '/employees', roles: ['admin', 'viewer'] },
    { title: 'الآليات', value: stats.machineryCount, icon: Truck, color: 'bg-orange-500', path: '/machinery', roles: ['admin', 'viewer'] },
    { title: 'الوثائق', value: stats.documentsCount, icon: FolderOpen, color: 'bg-purple-500', path: '/documents', roles: ['admin', 'viewer', 'diwan'] },
    { title: 'المشاريع', value: stats.projectsCount, icon: Briefcase, color: 'bg-indigo-500', path: '/projects', roles: ['admin', 'viewer'] },
    { title: 'الشكاوى', value: stats.complaintsCount, icon: MessageSquare, color: 'bg-rose-500', path: '/complaints', roles: ['admin', 'viewer'] },
    { title: 'الرخص', value: stats.licensesCount, icon: FileSignature, color: 'bg-cyan-500', path: '/licenses', roles: ['admin', 'viewer'] },
    { title: 'إجمالي السكان', value: stats.databank?.totalPopulation || 0, icon: Users, color: 'bg-emerald-500', path: '/databank', roles: ['admin'] },
    { title: 'الأحياء', value: stats.databank?.neighborhoodsCount || 0, icon: Building2, color: 'bg-teal-500', path: '/databank/neighborhoods', roles: ['admin'] },
  ];

  const visibleCards = cards.filter(card => card.roles.includes(userRole));

  const COLORS = ['#1a3622', '#d4af37', '#2a4a32', '#c4a030', '#3a5a42', '#e4bf47'];

  return (
    <div className="p-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-[#1a3622] mb-8 animate-slide-up">لوحة القيادة</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {visibleCards.map((card, i) => (
          <div 
            key={i} 
            onClick={() => navigate(card.path)}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4 space-x-reverse cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37] animate-slide-up"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
          >
            <div className={`p-4 rounded-lg ${card.color} text-white`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <h2 className="text-xl font-bold text-[#1a3622] mb-6">توزع الموظفين حسب القسم</h2>
          <div className="h-72">
            {stats.employeesByDept.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.employeesByDept} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f3f4f6' }}
                  />
                  <Bar dataKey="value" fill="#d4af37" radius={[4, 4, 0, 0]} name="عدد الموظفين" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">لا توجد بيانات كافية</div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-slide-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
          <h2 className="text-xl font-bold text-[#1a3622] mb-6">حالة المشاريع</h2>
          <div className="h-72">
            {stats.projectsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.projectsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.projectsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">لا توجد بيانات كافية</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-slide-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
          <h2 className="text-xl font-bold text-[#1a3622] mb-6">حالة الشكاوى</h2>
          <div className="h-72">
            {stats.complaintsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.complaintsByStatus} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f3f4f6' }}
                  />
                  <Bar dataKey="value" fill="#e4bf47" radius={[4, 4, 0, 0]} name="العدد" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">لا توجد بيانات كافية</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-slide-up" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
          <h2 className="text-xl font-bold text-[#1a3622] mb-6">حالة الآليات</h2>
          <div className="h-72">
            {stats.machineryByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.machineryByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.machineryByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">لا توجد بيانات كافية</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-slide-up" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
        <div className="flex items-center gap-2 mb-6">
          <ActivityIcon className="text-[#d4af37]" />
          <h2 className="text-xl font-bold text-[#1a3622]">أحدث النشاطات</h2>
        </div>
        
        <div className="space-y-4">
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity: any, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
                  <Clock size={20} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-gray-900">{activity.details}</p>
                    <span className="text-sm text-gray-500" dir="ltr">
                      {new Date(activity.timestamp).toLocaleString('ar-SA')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    بواسطة: <span className="font-medium">{activity.user}</span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">لا توجد نشاطات حديثة</div>
          )}
        </div>
      </div>
    </div>
  );
}
