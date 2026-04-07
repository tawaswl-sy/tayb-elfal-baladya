import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map as MapIcon, Layers } from 'lucide-react';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  neighborhood: createIcon('blue'),
  school: createIcon('green'),
  facility: createIcon('yellow'),
  property: createIcon('red')
};

export default function GISMap() {
  const [data, setData] = useState({
    neighborhoods: [],
    schools: [],
    facilities: [],
    properties: []
  });
  const [filters, setFilters] = useState({
    neighborhoods: true,
    schools: true,
    facilities: true,
    properties: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [nRes, sRes, fRes, pRes] = await Promise.all([
        fetch('/api/databank/neighborhoods').then(res => res.json()),
        fetch('/api/databank/schools').then(res => res.json()),
        fetch('/api/databank/facilities').then(res => res.json()),
        fetch('/api/databank/properties').then(res => res.json())
      ]);
      setData({
        neighborhoods: nRes.filter((item: any) => item.latitude && item.longitude),
        schools: sRes.filter((item: any) => item.latitude && item.longitude),
        facilities: fRes.filter((item: any) => item.latitude && item.longitude),
        properties: pRes.filter((item: any) => item.latitude && item.longitude)
      });
    } catch (error) {
      console.error("Error fetching map data:", error);
    }
  };

  // Default center (can be updated based on actual data)
  const center: [number, number] = [35.15, 40.43]; // Deir ez-Zor approx

  return (
    <div className="p-8 animate-fade-in h-[calc(100vh-64px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a3622] p-3 rounded-lg text-[#d4af37]">
            <MapIcon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3622]">نظام الخرائط (GIS Lite)</h1>
            <p className="text-gray-500 mt-1">عرض تفاعلي لمواقع الأحياء، المدارس، المرافق والأملاك</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[#1a3622] font-bold border-b pb-2">
            <Layers size={20} />
            <h2>الطبقات</h2>
          </div>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.neighborhoods}
              onChange={(e) => setFilters({ ...filters, neighborhoods: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-gray-700">الأحياء</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.schools}
              onChange={(e) => setFilters({ ...filters, schools: e.target.checked })}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-700">المدارس</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.facilities}
              onChange={(e) => setFilters({ ...filters, facilities: e.target.checked })}
              className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-400"
            />
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span className="text-gray-700">المرافق العامة</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.properties}
              onChange={(e) => setFilters({ ...filters, properties: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-700">أملاك البلدية</span>
          </label>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative z-0">
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {filters.neighborhoods && data.neighborhoods.map((n: any) => (
              <Marker key={`n-${n.id}`} position={[parseFloat(n.latitude), parseFloat(n.longitude)]} icon={icons.neighborhood}>
                <Popup>
                  <div className="text-right" dir="rtl">
                    <h3 className="font-bold text-lg mb-1">{n.name}</h3>
                    <p><strong>السكان:</strong> {n.population}</p>
                    <p><strong>العائلات:</strong> {n.families_count}</p>
                    <p><strong>التوزع الإثني:</strong> {n.ethnic}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {filters.schools && data.schools.map((s: any) => (
              <Marker key={`s-${s.id}`} position={[parseFloat(s.latitude), parseFloat(s.longitude)]} icon={icons.school}>
                <Popup>
                  <div className="text-right" dir="rtl">
                    <h3 className="font-bold text-lg mb-1">{s.name}</h3>
                    <p><strong>النوع:</strong> {s.type}</p>
                    <p><strong>المدرسين:</strong> {s.teachers_count}</p>
                    <p><strong>الطلاب:</strong> {(Number(s.students?.primary||0) + Number(s.students?.middle||0) + Number(s.students?.secondary||0))}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {filters.facilities && data.facilities.map((f: any) => (
              <Marker key={`f-${f.id}`} position={[parseFloat(f.latitude), parseFloat(f.longitude)]} icon={icons.facility}>
                <Popup>
                  <div className="text-right" dir="rtl">
                    <h3 className="font-bold text-lg mb-1">{f.name}</h3>
                    <p><strong>النوع:</strong> {f.type}</p>
                    <p><strong>الحالة:</strong> {f.condition}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {filters.properties && data.properties.map((p: any) => (
              <Marker key={`p-${p.id}`} position={[parseFloat(p.latitude), parseFloat(p.longitude)]} icon={icons.property}>
                <Popup>
                  <div className="text-right" dir="rtl">
                    <h3 className="font-bold text-lg mb-1">{p.type}</h3>
                    <p><strong>الحالة:</strong> {p.rented ? 'مؤجر' : 'غير مؤجر'}</p>
                    {p.rented && (
                      <>
                        <p><strong>المستأجر:</strong> {p.tenant_name}</p>
                        <p><strong>القيمة:</strong> {p.rent_value} ل.س</p>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
