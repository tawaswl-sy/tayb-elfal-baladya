import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

interface FileViewerProps {
  url: string;
  type: string;
  name: string;
}

export default function FileViewer({ url, type, name }: FileViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('فشل تحميل الملف');
        const arrayBuffer = await response.arrayBuffer();

        if (!isMounted) return;

        if (type === 'excel') {
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const html = XLSX.utils.sheet_to_html(worksheet);
          setContent(html);
        } else if (type === 'word') {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setContent(result.value);
        }
      } catch (err) {
        console.error('Error loading file:', err);
        if (isMounted) setError('حدث خطأ أثناء محاولة عرض الملف.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (type === 'excel' || type === 'word') {
      loadFile();
    }

    return () => {
      isMounted = false;
    };
  }, [url, type]);

  if (type === 'image') {
    return <img src={url} alt={name} className="max-w-full max-h-full object-contain" />;
  }

  if (type === 'pdf' || type === 'text') {
    return <iframe src={url} className="w-full h-full border-0 bg-white shadow-sm" title={name} />;
  }

  if (type === 'excel' || type === 'word') {
    if (loading) {
      return <div className="flex items-center justify-center h-full text-gray-500">جاري تحميل المستند...</div>;
    }
    if (error) {
      return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
    }
    return (
      <div 
        className="w-full h-full bg-white p-8 overflow-auto shadow-sm prose max-w-none"
        style={{ direction: 'rtl' }}
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
    );
  }

  return (
    <div className="text-center flex flex-col items-center">
      <p className="text-gray-600 mb-6">لا يتوفر معاينة لهذا النوع من الملفات</p>
    </div>
  );
}
