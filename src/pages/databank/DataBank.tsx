import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, Users, Map as MapIcon, School, Building, Home, Settings, PieChart as PieChartIcon, Printer, HeartHandshake } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function DataBank() {
  const [stats, setStats] = useState({
    totalPopulation: 0,
    usedPopulation: 0,
    neighborhoodsCount: 0,
    schoolsCount: 0,
    studentsCount: 0,
    facilitiesCount: 0,
    propertiesCount: 0,
    socialSupportCount: 0,
    socialSupportDistribution: [],
    tribesDistribution: [],
    studentsDistribution: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const fetchJson = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        return res.json();
      };

      const [popRes, neighRes, schoolsRes, facRes, propRes, tribesRes, socialRes] = await Promise.all([
        fetchJson('/api/databank/population'),
        fetchJson('/api/databank/neighborhoods'),
        fetchJson('/api/databank/schools'),
        fetchJson('/api/databank/facilities'),
        fetchJson('/api/databank/properties'),
        fetchJson('/api/databank/tribes'),
        fetchJson('/api/databank/social-support')
      ]);

      const usedPopulation = neighRes.reduce((sum: number, n: any) => sum + Number(n.population || 0), 0);
      
      let totalStudents = 0;
      let primary = 0;
      let middle = 0;
      let secondary = 0;
      
      schoolsRes.forEach((s: any) => {
        const p = Number(s.students?.primary || 0);
        const m = Number(s.students?.middle || 0);
        const sec = Number(s.students?.secondary || 0);
        primary += p;
        middle += m;
        secondary += sec;
        totalStudents += (p + m + sec);
      });

      const tribesDist = tribesRes.map((t: any) => {
        const pop = neighRes.filter((n: any) => n.tribe_id === t.id).reduce((sum: number, n: any) => sum + Number(n.population || 0), 0);
        return { name: t.name, value: pop };
      }).filter((t: any) => t.value > 0);

      const socialDist = socialRes.reduce((acc: any, curr: any) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalPopulation: popRes.total_population || 0,
        usedPopulation,
        neighborhoodsCount: neighRes.length,
        schoolsCount: schoolsRes.length,
        studentsCount: totalStudents,
        facilitiesCount: facRes.length,
        propertiesCount: propRes.length,
        socialSupportCount: socialRes.length,
        socialSupportDistribution: Object.entries(socialDist).map(([name, value]) => ({ name, value })),
        tribesDistribution: tribesDist,
        studentsDistribution: [
          { name: 'ابتدائي', value: primary },
          { name: 'إعدادي', value: middle },
          { name: 'ثانوي', value: secondary }
        ].filter(s => s.value > 0)
      });
    } catch (error) {
      console.error('Error fetching databank stats:', error);
    }
  };

  const COLORS = ['#1a3622', '#d4af37', '#2a4a32', '#c4a030', '#3a5a42', '#e4bf47'];

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-xl text-[#d4af37]">
            <Database size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">بنك المعلومات</h1>
            <p className="text-gray-500 mt-1">نظام إدارة بيانات البلدية الشامل</p>
          </div>
        </div>
        <button
          onClick={() => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;
            printWindow.document.write(`
              <html dir="rtl">
                <head>
                  <title>ملخص بنك المعلومات</title>
                  <style>
                    body { font-family: Arial; padding: 40px; }
                    .header { text-align: center; border-bottom: 2px solid #1a3622; padding-bottom: 20px; margin-bottom: 40px; }
                    .stats-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                    .stat-card { border: 1px solid #ddd; padding: 20px; border-radius: 10px; }
                    .stat-title { color: #666; font-size: 14px; margin-bottom: 5px; }
                    .stat-value { font-size: 24px; font-weight: bold; color: #1a3622; }
                    .section-title { font-size: 20px; font-weight: bold; margin-bottom: 20px; border-right: 4px solid #d4af37; padding-right: 10px; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>ملخص بنك المعلومات - بلدية دير الزور</h1>
                    <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SY')}</p>
                  </div>
                  
                  <div class="section-title">الإحصائيات العامة</div>
                  <div class="stats-grid">
                    <div class="stat-card">
                      <div class="stat-title">إجمالي السكان</div>
                      <div class="stat-value">${stats.totalPopulation} نسمة</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-title">عدد الأحياء</div>
                      <div class="stat-value">${stats.neighborhoodsCount} حي</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-title">عدد المدارس</div>
                      <div class="stat-value">${stats.schoolsCount} مدرسة</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-title">إجمالي الطلاب</div>
                      <div class="stat-value">${stats.studentsCount} طالب</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-title">المرافق العامة</div>
                      <div class="stat-value">${stats.facilitiesCount} مرفق</div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-title">أملاك البلدية</div>
                      <div class="stat-value">${stats.propertiesCount} عقار</div>
                    </div>
                  </div>

                  <div class="section-title">توزيع السكان حسب العشائر</div>
                  <ul>
                    ${stats.tribesDistribution.map((t: any) => `<li>${t.name}: ${t.value} نسمة</li>`).join('')}
                  </ul>

                  <script>window.print();</script>
                </body>
              </html>
            `);
            printWindow.document.close();
          }}
          className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm font-bold"
        >
          <Printer size={20} />
          طباعة الملخص الإحصائي
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <Link to="/databank/map" className="bg-[#1a3622] text-white p-4 rounded-2xl shadow-md hover:bg-[#2a4a32] transition-all text-center flex flex-col items-center gap-2 border-2 border-[#d4af37]">
          <MapIcon size={32} className="text-[#d4af37]" />
          <span className="font-bold">الخريطة التفاعلية</span>
        </Link>
        <Link to="/databank/population" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <Settings size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">إعدادات السكان</span>
        </Link>
        <Link to="/databank/neighborhoods" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <Home size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">الأحياء</span>
        </Link>
        <Link to="/databank/tribes" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <Users size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">العشائر</span>
        </Link>
        <Link to="/databank/schools" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <School size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">المدارس</span>
        </Link>
        <Link to="/databank/facilities" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <Building size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">المرافق العامة</span>
        </Link>
        <Link to="/databank/properties" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <Database size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">أملاك البلدية</span>
        </Link>
        <Link to="/databank/social-support" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <HeartHandshake size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">الدعم الاجتماعي</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-500 text-white">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">إجمالي السكان</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalPopulation}</h3>
            <p className="text-xs text-gray-400 mt-1">المسجل: {stats.usedPopulation}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-green-500 text-white">
            <Home size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">عدد الأحياء</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.neighborhoodsCount}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-yellow-500 text-white">
            <School size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">المدارس والطلاب</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.schoolsCount} مدرسة</h3>
            <p className="text-xs text-gray-400 mt-1">{stats.studentsCount} طالب</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-purple-500 text-white">
            <Building size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">المرافق والأملاك</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.facilitiesCount + stats.propertiesCount}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-rose-500 text-white">
            <HeartHandshake size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">حالات الدعم</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.socialSupportCount}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden relative group">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <MapIcon className="text-[#1a3622]" size={24} />
            <h2 className="text-xl font-bold text-[#1a3622]">نظرة عامة على الخريطة</h2>
          </div>
          <Link to="/databank/map" className="text-[#d4af37] font-bold hover:underline flex items-center gap-1">
            عرض الخريطة الكاملة
            <span className="text-lg">←</span>
          </Link>
        </div>
        <div className="h-64 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/400?blur=2')] bg-cover bg-center opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
            <Link to="/databank/map" className="bg-[#1a3622] text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 transform group-hover:scale-105 transition-transform">
              <MapIcon size={20} />
              فتح الخريطة التفاعلية
            </Link>
          </div>
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-sm text-xs space-y-1 border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>الأحياء: {stats.neighborhoodsCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>المدارس: {stats.schoolsCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span>المرافق: {stats.facilitiesCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#1a3622] mb-6">توزيع السكان حسب العشائر</h2>
          <div className="h-72">
            {stats.tribesDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.tribesDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.tribesDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">لا توجد بيانات</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#1a3622] mb-6">توزيع الطلاب حسب المرحلة</h2>
          <div className="h-72">
            {stats.studentsDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.studentsDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#d4af37" radius={[4, 4, 0, 0]} name="عدد الطلاب" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">لا توجد بيانات</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
