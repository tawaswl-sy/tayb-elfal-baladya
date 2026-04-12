import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSearchParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Map as MapIcon, Layers, School, Hospital, Trees, Droplets, 
  Zap, Building2, ShieldCheck, Mail, HelpCircle, Moon, HeartHandshake 
} from 'lucide-react';

// Component to handle map centering and zooming
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

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
  property: createIcon('red'),
  socialSupport: createIcon('violet')
};

const facilityTypeIcons: Record<string, any> = {
  'مسجد': Moon,
  'مدرسة': School,
  'مركز صحي': Hospital,
  'حديقة': Trees,
  'بئر مياه': Droplets,
  'محطة كهرباء': Zap,
  'بلدية': Building2,
  'مخفر شرطة': ShieldCheck,
  'بريد': Mail,
  'أخرى': HelpCircle
};

const facilityTypeColors: Record<string, string> = {
  'مسجد': '#3b82f6', // Blue
  'مدرسة': '#10b981', // Green
  'مركز صحي': '#ef4444', // Red
  'حديقة': '#22c55e', // Emerald
  'بئر مياه': '#0ea5e9', // Sky
  'محطة كهرباء': '#f59e0b', // Amber
  'بلدية': '#6366f1', // Indigo
  'مخفر شرطة': '#475569', // Slate
  'بريد': '#ec4899', // Pink
  'أخرى': '#94a3b8'  // Gray
};

const getFacilitySvg = (type: string) => {
  switch (type) {
    case 'مسجد':
      return '<path d="M2 22h20"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M5 18v4"/><path d="M19 18v4"/><path d="M12 6c-3.31 0-6 2.69-6 6v6h12v-6c0-3.31-2.69-6-6-6z"/>';
    case 'مدرسة':
      return '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>';
    case 'مركز صحي':
      return '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>';
    case 'حديقة':
      return '<path d="M10 10v.01"/><path d="M14 10v.01"/><path d="M10 14v.01"/><path d="M14 14v.01"/><circle cx="12" cy="12" r="10"/>';
    case 'بئر مياه':
      return '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>';
    case 'محطة كهرباء':
      return '<path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 L13 2 Z"/>';
    case 'بلدية':
      return '<path d="M2 22h20"/><path d="M7 22v-4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v4"/><path d="M9 17v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5"/><path d="M12 11V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"/><path d="M21 6h-5a2 2 0 0 0-2 2v3"/>';
    case 'مخفر شرطة':
      return '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/>';
    case 'بريد':
      return '<path d="M22 6H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>';
    default:
      return '<circle cx="12" cy="12" r="10"/>';
  }
};

export default function GISMap() {
  const [searchParams] = useSearchParams();
  const paramLat = searchParams.get('lat');
  const paramLng = searchParams.get('lng');

  const [data, setData] = useState({
    neighborhoods: [],
    schools: [],
    facilities: [],
    properties: [],
    socialSupport: []
  });
  const [filters, setFilters] = useState({
    neighborhoods: true,
    schools: true,
    facilities: true,
    properties: true,
    socialSupport: false // Default to off for privacy
  });
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  
  // Initial center and zoom
  const [center, setCenter] = useState<[number, number]>(
    paramLat && paramLng ? [parseFloat(paramLat), parseFloat(paramLng)] : [35.15, 40.43]
  );
  const [zoom, setZoom] = useState(paramLat && paramLng ? 16 : 13);

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

      const [nRes, sRes, fRes, pRes, ssRes] = await Promise.all([
        fetchJson('/api/databank/neighborhoods'),
        fetchJson('/api/databank/schools'),
        fetchJson('/api/databank/facilities'),
        fetchJson('/api/databank/properties'),
        fetchJson('/api/databank/social-support')
      ]);

      const neighborhoods = nRes.filter((item: any) => item.latitude && item.longitude);
      const schools = sRes.filter((item: any) => item.latitude && item.longitude);
      const facilities = fRes.filter((item: any) => item.latitude && item.longitude);
      const properties = pRes.filter((item: any) => item.latitude && item.longitude);
      const socialSupport = ssRes.filter((item: any) => item.latitude && item.longitude);

      setData({
        neighborhoods,
        schools,
        facilities,
        properties,
        socialSupport
      });

      // If no params provided, center on the latest added item across all categories
      if (!paramLat && !paramLng) {
        const allItems = [...neighborhoods, ...schools, ...facilities, ...properties, ...socialSupport];
        if (allItems.length > 0) {
          // Sort by ID descending to find the latest (assuming IDs are numeric and sequential)
          const latest = allItems.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
          if (latest && latest.latitude && latest.longitude) {
            setCenter([parseFloat(latest.latitude), parseFloat(latest.longitude)]);
            setZoom(15);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching map data:", error);
    }
  };

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

        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setMapType('streets')}
            className={`px-4 py-2 rounded-lg transition-all ${mapType === 'streets' ? 'bg-[#1a3622] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            خريطة الشوارع
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-4 py-2 rounded-lg transition-all ${mapType === 'satellite' ? 'bg-[#1a3622] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            قمر صناعي
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[#1a3622] font-bold border-b pb-2">
            <Layers size={20} />
            <h2>الطبقات المعروضة</h2>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                <span className="text-gray-700 font-medium">الأحياء</span>
              </div>
              <input
                type="checkbox"
                checked={filters.neighborhoods}
                onChange={(e) => setFilters({ ...filters, neighborhoods: e.target.checked })}
                className="w-4 h-4 text-[#1a3622] rounded focus:ring-[#1a3622]"
              />
            </label>
            
            <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                <span className="text-gray-700 font-medium">المدارس</span>
              </div>
              <input
                type="checkbox"
                checked={filters.schools}
                onChange={(e) => setFilters({ ...filters, schools: e.target.checked })}
                className="w-4 h-4 text-[#1a3622] rounded focus:ring-[#1a3622]"
              />
            </label>
            
            <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
                <span className="text-gray-700 font-medium">المرافق العامة</span>
              </div>
              <input
                type="checkbox"
                checked={filters.facilities}
                onChange={(e) => setFilters({ ...filters, facilities: e.target.checked })}
                className="w-4 h-4 text-[#1a3622] rounded focus:ring-[#1a3622]"
              />
            </label>
            
            <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                <span className="text-gray-700 font-medium">أملاك البلدية</span>
              </div>
              <input
                type="checkbox"
                checked={filters.properties}
                onChange={(e) => setFilters({ ...filters, properties: e.target.checked })}
                className="w-4 h-4 text-[#1a3622] rounded focus:ring-[#1a3622]"
              />
            </label>

            <label className="flex items-center justify-between p-2 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></div>
                <span className="text-rose-700 font-bold">الحالات الاجتماعية</span>
              </div>
              <input
                type="checkbox"
                checked={filters.socialSupport}
                onChange={(e) => setFilters({ ...filters, socialSupport: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
              />
            </label>
          </div>

          <div className="mt-auto pt-4 border-t text-xs text-gray-400 text-center">
            <p>نظام المعلومات الجغرافي v1.0</p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative z-0">
          <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <MapController center={center} zoom={zoom} />
            {mapType === 'streets' ? (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            ) : (
              <>
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <TileLayer
                  url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                />
              </>
            )}
            
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

            {filters.facilities && data.facilities.map((f: any) => {
              const Icon = facilityTypeIcons[f.type] || HelpCircle;
              const color = facilityTypeColors[f.type] || '#f59e0b';
              
              // Create a custom icon using the Lucide icon
              const customIcon = L.divIcon({
                html: `<div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transform: rotate(45deg);">
                        <div style="transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            ${getFacilitySvg(f.type)}
                          </svg>
                        </div>
                      </div>`,
                className: 'custom-facility-marker',
                iconSize: [34, 34],
                iconAnchor: [17, 17]
              });

              return (
                <Marker key={`f-${f.id}`} position={[parseFloat(f.latitude), parseFloat(f.longitude)]} icon={customIcon}>
                  <Popup>
                    <div className="text-right p-1" dir="rtl">
                      <div className="flex items-center gap-2 mb-2 border-b pb-1">
                        <Icon size={16} className="text-[#1a3622]" />
                        <h3 className="font-bold text-gray-900">{f.name}</h3>
                      </div>
                      <p className="text-xs text-gray-600 mb-1"><strong>النوع:</strong> {f.type}</p>
                      <p className="text-xs text-gray-600">
                        <strong>الحالة:</strong> 
                        <span className={`mr-1 ${
                          f.condition === 'ممتازة' ? 'text-green-600' :
                          f.condition === 'جيدة' ? 'text-blue-600' :
                          f.condition === 'مقبولة' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {f.condition}
                        </span>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

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

            {filters.socialSupport && data.socialSupport.map((ss: any) => (
              <Marker key={`ss-${ss.id}`} position={[parseFloat(ss.latitude), parseFloat(ss.longitude)]} icon={icons.socialSupport}>
                <Popup>
                  <div className="text-right p-1" dir="rtl">
                    <div className="flex items-center gap-2 mb-2 border-b pb-1">
                      <HeartHandshake size={16} className="text-rose-600" />
                      <h3 className="font-bold text-gray-900">{ss.fullName}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-1"><strong>التصنيف:</strong> {ss.category}</p>
                    <p className="text-xs text-gray-600 mb-1"><strong>الحالة:</strong> {ss.socialStatus}</p>
                    <p className="text-xs text-gray-600"><strong>العنوان:</strong> {ss.address}</p>
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
