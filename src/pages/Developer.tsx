import React from 'react';
import { Code2, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Developer() {
  return (
    <div className="p-8 animate-fade-in min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#1a3622] to-[#2a4a32]"></div>
        
        <div className="relative z-10">
          <div className="w-32 h-32 bg-white rounded-full mx-auto border-4 border-white shadow-lg flex items-center justify-center mb-6 overflow-hidden">
            <div className="w-full h-full bg-[#f8f9fa] flex items-center justify-center text-[#1a3622]">
              <Code2 size={64} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">حامد فرحان الحماده</h1>
          <h2 className="text-xl text-[#d4af37] font-semibold mb-6">مهندس برمجيات ومطور النظام</h2>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-right">
            <h3 className="font-bold text-gray-900 mb-2 border-b pb-2">عن المشروع</h3>
            <p className="text-gray-600 leading-relaxed">
              <strong>اسم المشروع:</strong> مدير البلدية<br/>
              <strong>الإصدار:</strong> v3.0<br/>
              <strong>الوصف:</strong> نظام متكامل لإدارة بيانات البلديات والخدمات والمرافق باستخدام أحدث التقنيات، مصمم ليعمل كبنك معلومات متقدم ونواة لنظام دعم قرار حكومي (Smart Municipality System).
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <a href="mailto:7amedhazza3@gmail.com" className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl transition-colors">
              <Mail size={20} className="text-[#1a3622]" />
              <span dir="ltr">7amedhazza3@gmail.com</span>
            </a>
            <a href="tel:+963900000000" className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl transition-colors">
              <Phone size={20} className="text-[#1a3622]" />
              <span dir="ltr">+963 900 000 000</span>
            </a>
          </div>
          
          <button className="bg-[#1a3622] text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#2a4a32] transition-colors w-full sm:w-auto mx-auto shadow-md hover:shadow-lg">
            <ExternalLink size={20} />
            تواصل مع المطور
          </button>
        </div>
      </div>
    </div>
  );
}
