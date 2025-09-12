import { NextRequest, NextResponse } from "next/server";
import { BajieClient } from "@/lib/bajie";

export const dynamic = "force-dynamic";

// Координаты ваших устройств в Москве
// TODO: получать из БД или Bajie API
const DEVICE_LOCATIONS = [
  {
    id: "DTA35552",
    name: "ТЦ Метрополис",
    address: "Ленинградское шоссе, 16А",
    lat: 55.7914,
    lng: 37.5376,
    available: 8,
    total: 8,
    online: true
  },
  {
    id: "DTA35567",
    name: "ТЦ Европейский",
    address: "пл. Киевского Вокзала, 2",
    lat: 55.7456,
    lng: 37.5675,
    available: 5,
    total: 8,
    online: true
  },
  {
    id: "DTA35566",
    name: "ТЦ Афимолл",
    address: "Пресненская наб., 2",
    lat: 55.7496,
    lng: 37.5396,
    available: 3,
    total: 8,
    online: false
  },
  {
    id: "DTA35565",
    name: "БЦ Белая площадь",
    address: "ул. Лесная, 5",
    lat: 55.7747,
    lng: 37.5857,
    available: 6,
    total: 8,
    online: true
  },
  {
    id: "DTA35564",
    name: "Аэропорт Внуково",
    address: "Терминал А",
    lat: 55.5964,
    lng: 37.2675,
    available: 7,
    total: 8,
    online: true
  },
  {
    id: "DTA35563",
    name: "ТЦ МЕГА Химки",
    address: "МКАД, 72-й километр",
    lat: 55.9116,
    lng: 37.3986,
    available: 4,
    total: 8,
    online: true
  },
  {
    id: "DTA35562",
    name: "Киевский вокзал",
    address: "пл. Киевского Вокзала, 1",
    lat: 55.7434,
    lng: 37.5654,
    available: 2,
    total: 8,
    online: true
  },
  {
    id: "DTA35561",
    name: "ТЦ Авиапарк",
    address: "Ходынский б-р, 4",
    lat: 55.7902,
    lng: 37.5322,
    available: 8,
    total: 8,
    online: true
  },
  {
    id: "DTA35560",
    name: "Павелецкий вокзал",
    address: "Павелецкая пл., 1",
    lat: 55.7304,
    lng: 37.6386,
    available: 5,
    total: 8,
    online: true
  },
  {
    id: "DTA35559",
    name: "Курский вокзал",
    address: "ул. Земляной Вал, 29",
    lat: 55.7730,
    lng: 37.6594,
    available: 6,
    total: 8,
    online: true
  }
];

export async function GET(req: NextRequest) {
  try {
    // В будущем можно обновлять данные из Bajie API
    // const bajie = new BajieClient();
    // for (const location of DEVICE_LOCATIONS) {
    //   const info = await bajie.getDeviceInfo(location.id);
    //   if (info.data?.code === 0) {
    //     location.available = info.data.data.cabinet.emptySlots;
    //     location.online = true;
    //   }
    // }

    return NextResponse.json({
      success: true,
      locations: DEVICE_LOCATIONS,
      total: DEVICE_LOCATIONS.length,
      online: DEVICE_LOCATIONS.filter(l => l.online).length
    });

  } catch (error) {
    console.error("Locations API error:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch locations",
      locations: []
    }, { status: 500 });
  }
}
