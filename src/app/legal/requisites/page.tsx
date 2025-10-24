"use client";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function RequisitesPage() {
  const rows = [
    { k: "Наименование", v: "Глава крестьянского (фермерского) хозяйства — индивидуальный предприниматель СТИГЕР АНИСА ГИВИЕВНА" },
    { k: "ИНН", v: "481002190826" },
    { k: "ОГРНИП", v: "325508100037955" },
    { k: "Банк получателя", v: "ПАО Сбербанк" },
    { k: "БИК", v: "044525225" },
    { k: "Корр. счёт", v: "30101 810 4 0000 0000225" },
    { k: "Расчётный счёт", v: "40802 810 9 3871 0013275" },
    { k: "ИНН банка", v: "7707083893" },
  ];

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-3xl px-6 py-10 w-full space-y-6">
        <h1 className="text-2xl font-bold">Реквизиты</h1>
        <div className="glass-effect rounded-2xl p-6 shadow-xl space-y-3">
          {rows.map((r) => (
            <div key={r.k} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b last:border-b-0 border-black/5 dark:border-white/10">
              <div className="text-sm opacity-70">{r.k}</div>
              <div className="font-medium break-all">{r.v}</div>
            </div>
          ))}
          <div className="pt-2 text-sm opacity-70">Для безналичных платежей указывайте назначение: «Оплата аренды зарядного устройства Stiger».</div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}




