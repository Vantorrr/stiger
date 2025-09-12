"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Динамический импорт для избежания SSR ошибок
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

// Фикс для иконок Leaflet
import L from "leaflet";

// Ваши реальные устройства с координатами
const DEVICE_LOCATIONS = [
  {
    id: "DTA35552",
    name: "ТЦ Афимолл Сити",
    address: "Москва Сити, 2 этаж, Starbucks Coffee",
    lat: 55.7496, // Реальные координаты Афимолл
    lng: 37.5396,
    available: 8,
    total: 8,
    online: true,
    active: true // Пометка что это ваш включенный шкаф
  },
  {
    id: "DTA35567",
    name: "ТЦ Европейский",
    address: "пл. Киевского Вокзала, 2, 1 этаж у входа",
    lat: 55.7456,
    lng: 37.5675,
    available: 5,
    total: 8,
    online: true
  },
  {
    id: "DTA35566",
    name: "Метро Арбатская",
    address: "Выход к ул. Новый Арбат",
    lat: 55.7520,
    lng: 37.6004,
    available: 3,
    total: 8,
    online: true
  },
  {
    id: "DTA35565",
    name: "БЦ Белая площадь",
    address: "ул. Лесная, 5",
    lat: 55.7747,
    lng: 37.5857,
    available: 0,
    total: 8,
    online: false
  }
];

interface InteractiveMapProps {
  onDeviceSelect?: (deviceId: string) => void;
  className?: string;
}

export default function InteractiveMap({ onDeviceSelect, className = "" }: InteractiveMapProps) {
  const [map, setMap] = useState<any>(null);
  const router = useRouter();
  const [locations, setLocations] = useState<typeof DEVICE_LOCATIONS>(DEVICE_LOCATIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Фикс иконок маркеров
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });
    
    // Загружаем данные
    fetchLocations();
    
    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchLocations, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      if (data.success && data.locations) {
        setLocations(data.locations);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCustomIcon = (device: typeof DEVICE_LOCATIONS[0]) => {
    const color = device.active ? "#7c3aed" : device.online && device.available > 0 ? "#10b981" : device.online ? "#ef4444" : "#6b7280";
    const size = device.active ? 50 : 40;
    
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${device.active ? '20px' : '16px'};
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          border: 3px solid white;
          ${device.active ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${device.active ? '⚡' : device.available}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const handleMarkerClick = (deviceId: string) => {
    if (onDeviceSelect) {
      onDeviceSelect(deviceId);
    } else {
      router.push(`/scan?deviceId=${deviceId}`);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        .leaflet-container {
          width: 100%;
          height: 100%;
        }
      `}</style>
      
      <MapContainer
        center={[55.7496, 37.5396]}
        zoom={13}
        className={className}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((device) => (
          <Marker
            key={device.id}
            position={[device.lat, device.lng]}
            icon={createCustomIcon(device)}
          >
            <Popup>
              <div className="p-4 min-w-[280px]">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    ⚡
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg leading-tight">{device.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{device.address}</p>
                  </div>
                </div>
                
                {device.online ? (
                  <>
                    <div className="mb-3 p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Доступно power bank:</span>
                        <span className={`font-bold text-lg ${device.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {device.available}/{device.total}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(device.total)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-2 rounded-full ${
                              i < device.available ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {device.available > 0 ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMarkerClick(device.id);
                        }}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                      >
                        Взять заряд
                      </button>
                    ) : (
                      <div className="text-center py-3 text-red-600 font-medium">
                        Все power bank заняты
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-3 text-gray-500">
                    Устройство временно недоступно
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
