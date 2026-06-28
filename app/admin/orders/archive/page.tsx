import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ARXIV_HOLATLAR } from "@/lib/buyurtma";
import OrdersTable, { type BuyurtmaQator } from "@/components/admin/OrdersTable";

export default async function AdminOrdersArchive() {
  const supabase = await createSupabaseServer();
  const { data, count } = await supabase
    .from("buyurtmalar")
    .select(
      "id,raqam,mijoz_ism,telefon,holat,jami,valyuta,yaratilgan_vaqt,elementlar:buyurtma_elementlari(soni)",
      { count: "exact" },
    )
    .in("holat", ARXIV_HOLATLAR)
    .order("yaratilgan_vaqt", { ascending: false });

  const buyurtmalar = (data ?? []) as unknown as BuyurtmaQator[];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Arxiv buyurtmalar
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            <span className="font-semibold text-zinc-900">{count ?? 0}</span> ta
            tugallangan yoki bekor qilingan buyurtma.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 px-3.5 py-2 text-sm font-semibold text-zinc-700 no-underline transition-colors hover:bg-zinc-100"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Faol buyurtmalar
        </Link>
      </header>

      <OrdersTable buyurtmalar={buyurtmalar} bosh="Arxivda buyurtma yo'q." />
    </div>
  );
}
