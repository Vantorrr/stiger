"use client";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function MapPage() {
  return (
    <AuthenticatedLayout>
      <div className="w-full h-[calc(100vh-64px)]">
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=37.59%2C55.74%2C37.64%2C55.77&layer=mapnik&marker=55.751244%2C37.618423"
          title="Карта зарядов Stiger"
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </AuthenticatedLayout>
  );
}


