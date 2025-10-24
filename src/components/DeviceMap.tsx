"use client";
import { useEffect, useState } from "react";

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  available: number;
  total: number;
  online: boolean;
}

export default function DeviceMap() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      if (data.success) {
        setLocations(data.locations);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  // Генерируем URL для OpenStreetMap с маркерами
  const generateMapUrl = () => {
    // Центр Москвы
    let centerLat = 55.751244;
    let centerLng = 37.618423;
    let zoom = 11;

    // Если выбрана локация, центрируем на ней
    if (selectedLocation) {
      const location = locations.find(l => l.id === selectedLocation);
      if (location) {
        centerLat = location.lat;
        centerLng = location.lng;
        zoom = 15;
      }
    }

    // Базовый URL OpenStreetMap
    const baseUrl = "https://www.openstreetmap.org/export/embed.html";
    const bbox = `${centerLng - 0.1},${centerLat - 0.05},${centerLng + 0.1},${centerLat + 0.05}`;
    
    return `${baseUrl}?bbox=${bbox}&layer=mapnik`;
  };

  return (
    <div className="relative w-full h-full">
      {/* Карта */}
      <iframe
        src={generateMapUrl()}
        title="Карта зарядов Stiger"
        className="w-full h-full border-0"
        loading="lazy"
      />

      {/* Оверлей с точками */}
      <div className="absolute inset-0 pointer-events-none">
        {locations.map((location) => (
          <div
            key={location.id}
            className="absolute pointer-events-auto"
            style={{
              // Простое позиционирование на карте
              // В реальном приложении нужна более точная проекция координат
              left: `${((location.lng - 37.2) / 0.5) * 100}%`,
              top: `${((55.95 - location.lat) / 0.4) * 100}%`,
              transform: "translate(-50%, -50%)"
            }}
          >
            <button
              onClick={() => setSelectedLocation(location.id)}
              className={`relative group ${
                location.online ? '' : 'opacity-60'
              }`}
            >
              {/* Маркер */}
              <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
                location.available > 0
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              } ${selectedLocation === location.id ? 'scale-125' : 'hover:scale-110'}`}>
                <span className="text-white font-bold text-sm">
                  {location.available}
                </span>
              </div>

              {/* Информация при наведении */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 whitespace-nowrap">
                  <div className="font-semibold text-sm">{location.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{location.address}</div>
                  <div className="text-xs mt-1">
                    {location.online ? (
                      <span className="text-green-600 dark:text-green-400">
                        Доступно: {location.available}/{location.total}
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">Офлайн</span>
                    )}
                  </div>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-2">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-gray-800"></div>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Легенда */}
      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg shadow-lg p-4">
        <h3 className="font-semibold text-sm mb-2">Легенда</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Есть свободные</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Все заняты</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span>Офлайн</span>
          </div>
        </div>
      </div>

      {/* Список устройств на мобильных */}
      <div className="absolute bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-48 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold mb-3">Ближайшие точки</h3>
          <div className="space-y-2">
            {locations
              .filter(l => l.online && l.available > 0)
              .slice(0, 3)
              .map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location.id)}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{location.name}</div>
                      <div className="text-xs text-gray-500">{location.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-semibold">{location.available}</div>
                      <div className="text-xs text-gray-500">доступно</div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}






