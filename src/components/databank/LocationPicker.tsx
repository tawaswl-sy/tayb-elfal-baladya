import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  lat?: string;
  lng?: string;
  onChange: (lat: string, lng: string) => void;
}

function MapEvents({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onClick,
  });
  return null;
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  
  const initialLat = lat && !isNaN(parseFloat(lat)) ? parseFloat(lat) : 35.15;
  const initialLng = lng && !isNaN(parseFloat(lng)) ? parseFloat(lng) : 40.43;

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    onChange(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">تحديد الموقع من الخريطة</label>
        <div className="flex bg-gray-100 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setMapType('streets')}
            className={`px-3 py-1 rounded-md transition-colors ${mapType === 'streets' ? 'bg-white shadow-sm text-[#1a3622] font-bold' : 'text-gray-500'}`}
          >
            خريطة
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1 rounded-md transition-colors ${mapType === 'satellite' ? 'bg-white shadow-sm text-[#1a3622] font-bold' : 'text-gray-500'}`}
          >
            قمر صناعي
          </button>
        </div>
      </div>
      
      <div className="h-64 rounded-lg border border-gray-300 overflow-hidden relative z-0">
        <MapContainer 
          center={[initialLat, initialLng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
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
          
          <MapEvents onClick={handleMapClick} />
          
          {lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng)) && (
            <Marker position={[parseFloat(lat), parseFloat(lng)]} />
          )}
        </MapContainer>
      </div>
      <p className="text-[10px] text-gray-400 text-center italic">انقر على الخريطة لتحديد الإحداثيات بدقة</p>
    </div>
  );
}
