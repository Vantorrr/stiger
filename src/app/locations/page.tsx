"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

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

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    } finally {
      setLoading(false);
    }
  };

  const handleRent = (locationId: string) => {
    router.push(`/rental/tariff?deviceId=${locationId}`);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка точек...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen">
        {/* Заголовок */}
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Точки аренды Stiger</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {locations.filter(l => l.online).length} активных точек в Москве
          </p>
        </div>

        {/* Список локаций */}
        <div className="px-6 py-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <div
                key={location.id}
                className={`glass-effect rounded-2xl p-6 transition-all ${
                  location.online ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-60'
                }`}
                onClick={() => location.online && setSelectedLocation(location)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{location.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {location.address}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    location.online ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>

                {location.online ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Доступно powerbank
                      </span>
                      <span className={`font-bold text-lg ${
                        location.available > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {location.available}/{location.total}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {[...Array(location.total)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-2 rounded-full ${
                            i < location.available
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>

                    {location.available > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRent(location.id);
                        }}
                        className="w-full h-10 rounded-xl gradient-bg text-white font-medium hover:shadow-lg transition-all"
                      >
                        Арендовать здесь
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Временно недоступно
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Модальное окно с деталями */}
        {selectedLocation && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedLocation(null)}
          >
            <div
              className="glass-premium rounded-3xl p-8 max-w-md w-full animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">{selectedLocation.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {selectedLocation.address}
              </p>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">ID устройства</span>
                    <span className="font-mono font-semibold">{selectedLocation.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Доступно</span>
                    <span className="font-semibold text-lg">
                      {selectedLocation.available} из {selectedLocation.total}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  {[...Array(selectedLocation.total)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-3 rounded-full ${
                        i < selectedLocation.available
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="flex-1 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Закрыть
                </button>
                {selectedLocation.available > 0 && (
                  <button
                    onClick={() => handleRent(selectedLocation.id)}
                    className="flex-1 h-12 rounded-xl gradient-bg text-white font-medium hover:shadow-lg transition-all"
                  >
                    Арендовать
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
