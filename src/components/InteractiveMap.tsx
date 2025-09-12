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
    name: "Тестовый шкаф (ВКЛЮЧЕН)",
    address: "Ваш адрес",
    lat: 55.751244, // Центр Москвы - замените на реальные координаты
    lng: 37.618423,
    available: 8,
    total: 8,
    online: true,
    active: true // Пометка что это ваш включенный шкаф
  },
  {
    id: "DTA35567",
    name: "ТЦ Европейский",
    address: "пл. Киевского Вокзала, 2",
    lat: 55.7456,
    lng: 37.5675,
    available: 0,
    total: 8,
    online: false
  },
  {
    id: "DTA35566",
    name: "ТЦ Афимолл",
    address: "Пресненская наб., 2",
    lat: 55.7496,
    lng: 37.5396,
    available: 0,
    total: 8,
    online: false
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

  useEffect(() => {
    // Фикс иконок маркеров
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    });
  }, []);

  const createCustomIcon = (device: typeof DEVICE_LOCATIONS[0]) => {
    const color = device.active ? "#10b981" : device.online ? "#3b82f6" : "#6b7280";
    const size = device.active ? 40 : 30;
    
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
          font-size: ${device.active ? '16px' : '12px'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ${device.active ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${device.available}
        </div>
        ${device.active ? `
          <div style="
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: #10b981;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
          ">
            ВАШ ШКАФ
          </div>
        ` : ''}
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
        center={[55.751244, 37.618423]}
        zoom={11}
        className={className}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {DEVICE_LOCATIONS.map((device) => (
          <Marker
            key={device.id}
            position={[device.lat, device.lng]}
            icon={createCustomIcon(device)}
            eventHandlers={{
              click: () => handleMarkerClick(device.id),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{device.name}</h3>
                <p className="text-sm text-gray-600">{device.address}</p>
                <div className="mt-2">
                  <p className="text-sm">
                    ID: <span className="font-mono">{device.id}</span>
                  </p>
                  <p className="text-sm">
                    Статус: {device.online ? (
                      <span className="text-green-600">Онлайн</span>
                    ) : (
                      <span className="text-red-600">Офлайн</span>
                    )}
                  </p>
                  {device.online && (
                    <p className="text-sm">
                      Доступно: <span className="font-bold">{device.available}/{device.total}</span>
                    </p>
                  )}
                </div>
                {device.online && device.available > 0 && (
                  <button
                    onClick={() => handleMarkerClick(device.id)}
                    className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Арендовать
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
