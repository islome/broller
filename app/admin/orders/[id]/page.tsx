import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatNarx, formatSana } from "@/lib/format";
import { holatBelgisi, yetkazishMatni, tolovMatni } from "@/lib/buyurtma";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import type { Buyurtma } from "@/lib/types";

const ELEMENT_SELECT =
  "id,mahsulot_id,mahsulot_nomi,mahsulot_slug,asosiy_rasm,birlik_narx,soni,valyuta";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data } = await supabase
    .from("buyurtmalar")
    .select(
      `id,raqam,holat,yetkazish_usuli,tolov_turi,mijoz_ism,telefon,viloyat,manzil,izoh,valyuta,jami,yaratilgan_vaqt,elementlar:buyurtma_elementlari(${ELEMENT_SELECT})`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const b = data as unknown as Buyurtma;
  const holat = holatBelgisi(b.holat);
  const elementlar = b.elementlar ?? [];

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 no-underline transition-colors hover:text-zinc-900"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Buyurtmalar
      </Link>

      <header className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Buyurtma #{b.raqam}
          </h1>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${holat.c}`}
          >
            {holat.t}
          </span>
        </div>
        <p className="text-sm text-zinc-400">{formatSana(b.yaratilgan_vaqt)}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* mahsulotlar */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-3">
            <h2 className="text-sm font-bold text-zinc-900">Mahsulotlar</h2>
          </div>
          <ul className="divide-y divide-zinc-100">
            {elementlar.map((el) => (
              <li key={el.id} className="flex items-center gap-4 px-5 py-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  <Image
                    src={el.asosiy_rasm || "/farm1.jpg"}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {el.mahsulot_slug ? (
                    <Link
                      href={`/products/${el.mahsulot_slug}`}
                      className="line-clamp-2 text-sm font-semibold text-zinc-900 no-underline hover:underline"
                    >
                      {el.mahsulot_nomi}
                    </Link>
                  ) : (
                    <span className="line-clamp-2 text-sm font-semibold text-zinc-900">
                      {el.mahsulot_nomi}
                    </span>
                  )}
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {el.soni} × {formatNarx(el.birlik_narx, el.valyuta)}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-zinc-900">
                  {formatNarx(el.birlik_narx * el.soni, el.valyuta)}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3">
            <span className="text-sm font-semibold text-zinc-900">Jami</span>
            <span className="text-lg font-bold text-zinc-900">
              {formatNarx(b.jami, b.valyuta)}
            </span>
          </div>
        </div>

        {/* yon panel */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-bold text-zinc-900">Holat</h2>
            <OrderStatusForm id={b.id} holat={b.holat} />
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-bold text-zinc-900">Mijoz</h2>
            <dl className="space-y-2 text-sm">
              <Qator label="Ism" value={b.mijoz_ism} />
              <Qator label="Telefon" value={b.telefon} />
              <Qator label="Usul" value={yetkazishMatni(b.yetkazish_usuli)} />
              <Qator label="To'lov" value={tolovMatni(b.tolov_turi)} />
              {b.yetkazish_usuli === "yetkazib_berish" && (
                <Qator
                  label="Manzil"
                  value={
                    [b.viloyat, b.manzil].filter(Boolean).join(", ") || "—"
                  }
                />
              )}
              {b.izoh && <Qator label="Izoh" value={b.izoh} />}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Qator({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-zinc-400">{label}</dt>
      <dd className="text-right font-medium text-zinc-900">{value}</dd>
    </div>
  );
}
