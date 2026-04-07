import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, Users, Map, School, Building, Home, Settings, PieChart as PieChartIcon } from 'lucide-react';
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
    tribesDistribution: [],
    studentsDistribution: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [popRes, neighRes, schoolsRes, facRes, propRes, tribesRes] = await Promise.all([
        fetch('/api/databank/population').then(res => res.json()),
        fetch('/api/databank/neighborhoods').then(res => res.json()),
        fetch('/api/databank/schools').then(res => res.json()),
        fetch('/api/databank/facilities').then(res => res.json()),
        fetch('/api/databank/properties').then(res => res.json()),
        fetch('/api/databank/tribes').then(res => res.json())
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

      setStats({
        totalPopulation: popRes.total_population || 0,
        usedPopulation,
        neighborhoodsCount: neighRes.length,
        schoolsCount: schoolsRes.length,
        studentsCount: totalStudents,
        facilitiesCount: facRes.length,
        propertiesCount: propRes.length,
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
          <div className="bg-[#1a3622] p-3 rounded-lg text-[#d4af37]">
            <Database size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">بنك المعلومات</h1>
            <p className="text-gray-500 mt-1">نظام إدارة بيانات البلدية الشامل</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-lg bg-blue-500 text-white">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">إجمالي السكان</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalPopulation}</h3>
            <p className="text-xs text-gray-400 mt-1">المسجل: {stats.usedPopulation}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-lg bg-green-500 text-white">
            <Home size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">عدد الأحياء</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.neighborhoodsCount}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-lg bg-yellow-500 text-white">
            <School size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">المدارس والطلاب</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.schoolsCount} مدرسة</h3>
            <p className="text-xs text-gray-400 mt-1">{stats.studentsCount} طالب</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-4 rounded-lg bg-purple-500 text-white">
            <Building size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">المرافق والأملاك</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.facilitiesCount + stats.propertiesCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link to="/databank/population" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <Settings size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">إعدادات السكان</span>
        </Link>
        <Link to="/databank/neighborhoods" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <Home size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">الأحياء</span>
        </Link>
        <Link to="/databank/tribes" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <Users size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">العشائر</span>
        </Link>
        <Link to="/databank/schools" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <School size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">المدارس</span>
        </Link>
        <Link to="/databank/facilities" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <Building size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">المرافق العامة</span>
        </Link>
        <Link to="/databank/properties" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#d4af37] hover:shadow-md transition-all text-center flex flex-col items-center gap-2">
          <Map size={32} className="text-[#1a3622]" />
          <span className="font-bold text-gray-800">أملاك البلدية</span>
        </Link>
      </div>
    </div>
  );
}
