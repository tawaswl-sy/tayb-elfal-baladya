import React, { useState, useEffect } from 'react';
import { Save, Users } from 'lucide-react';

export default function Population() {
  const [totalPopulation, setTotalPopulation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/databank/population')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch population');
        return res.json();
      })
      .then(data => setTotalPopulation(data.total_population || 0))
      .catch(err => console.error('Error fetching population:', err));
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/databank/population', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_population: totalPopulation })
      });
      if (res.ok) {
        alert('تم حفظ إجمالي السكان بنجاح');
      } else {
        alert('حدث خطأ أثناء الحفظ');
      }
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#1a3622] p-3 rounded-xl text-[#d4af37]">
          <Users size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1a3622]">إعدادات السكان</h1>
          <p className="text-gray-500 mt-1">تحديد إجمالي عدد السكان للمدينة</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">إجمالي السكان</label>
          <input
            type="number"
            value={totalPopulation}
            onChange={(e) => setTotalPopulation(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a3622] focus:border-transparent"
            min="0"
          />
          <p className="text-sm text-gray-500 mt-2 italic">ملاحظة: لا يمكن أن يتجاوز مجموع سكان الأحياء هذا الرقم.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-[#1a3622] text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#2a4a32] transition-all duration-300 disabled:opacity-50 font-bold shadow-lg"
        >
          <Save size={20} />
          {isLoading ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </div>
    </div>
  );
}
