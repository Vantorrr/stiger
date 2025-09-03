"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

// Демо-точки зарядов
const chargePoints = [
  { id: 1, lat: 55.751244, lng: 37.618423, name: "ТЦ Охотный Ряд", slots: 8, available: 5 },
  { id: 2, lat: 55.757814, lng: 37.621320, name: "Красная площадь", slots: 6, available: 3 },
  { id: 3, lat: 55.755826, lng: 37.617299, name: "ГУМ", slots: 12, available: 8 },
  { id: 4, lat: 55.753215, lng: 37.622504, name: "Метро Театральная", slots: 10, available: 2 },
  { id: 5, lat: 55.749792, lng: 37.624879, name: "Кафе на Никольской", slots: 4, available: 4 },
];

export default function MapEmbed() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    setReady(true);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (!ready) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Загрузка карты...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MapContainer 
        center={[55.751244, 37.618423]} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {chargePoints.map((point) => (
          <Marker key={point.id} position={[point.lat, point.lng]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm">{point.name}</h3>
                <p className="text-xs text-gray-600">
                  Доступно: {point.available}/{point.slots} слотов
                </p>
                <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                  Перейти к автомату
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
