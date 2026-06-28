import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatNarx, formatSana } from "@/lib/format";
import {
  holatBelgisi,
  yetkazishMatni,
  tolovMatni,
  bekorQilsaBoladi,
} from "@/lib/buyurtma";
import CancelOrderButton from "@/components/site/CancelOrderButton";
import type { Buyurtma } from "@/lib/types";

export const metadata = {
  title: "Buyurtmalarim — Broller",
};

const ELEMENT_SELECT =
  "id,mahsulot_id,mahsulot_nomi,mahsulot_slug,asosiy_rasm,birlik_narx,soni,valyuta";

export default async function MyOrdersPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/profile/orders");

  const { data } = await supabase
    .from("buyurtmalar")
    .select(
      `id,raqam,holat,yetkazish_usuli,tolov_turi,mijoz_ism,telefon,viloyat,manzil,izoh,valyuta,jami,yaratilgan_vaqt,elementlar:buyurtma_elementlari(${ELEMENT_SELECT})`,
    )
    .eq("foydalanuvchi_id", user.id)
    // bekor qilingan buyurtmalar xaridorga ko'rsatilmaydi
    .neq("holat", "bekor_qilindi")
    .order("yaratilgan_vaqt", { ascending: false });

  const buyurtmalar = (data ?? []) as unknown as Buyurtma[];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Navbar />

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
          <Link href="/" className="no-underline hover:text-zinc-700">
            Bosh sahifa
          </Link>
          <span>/</span>
          <Link href="/profile" className="no-underline hover:text-zinc-700">
            Profil
          </Link>
          <span>/</span>
          <span className="text-zinc-700">Buyurtmalar</span>
        </nav>

        <header className="mt-3 mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Buyurtmalarim
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {buyurtmalar.length > 0
              ? `Jami ${buyurtmalar.length} ta buyurtma.`
              : "Bu yerda buyurtmalaringiz tarixi ko'rinadi."}
          </p>
        </header>

        {buyurtmalar.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">Hozircha buyurtmangiz yo&apos;q.</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-zinc-800"
            >
              Mahsulotlarni ko&apos;rish
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {buyurtmalar.map((b) => (
              <OrderCard key={b.id} b={b} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function OrderCard({ b }: { b: Buyurtma }) {
  const holat = holatBelgisi(b.holat);
  const elementlar = b.elementlar ?? [];

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900">
              Buyurtma #{b.raqam}
            </h2>
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${holat.c}`}
            >
              {holat.t}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            {formatSana(b.yaratilgan_vaqt)} · {yetkazishMatni(b.yetkazish_usuli)}{" "}
            · {tolovMatni(b.tolov_turi)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">Jami</p>
          <p className="text-base font-bold text-zinc-900">
            {formatNarx(b.jami, b.valyuta)}
          </p>
        </div>
      </header>

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

      {(b.yetkazish_usuli === "yetkazib_berish" || b.izoh) && (
        <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-3 text-xs text-zinc-500">
          {b.yetkazish_usuli === "yetkazib_berish" && (b.viloyat || b.manzil) && (
            <p>
              <span className="font-medium text-zinc-600">Manzil:</span>{" "}
              {[b.viloyat, b.manzil].filter(Boolean).join(", ")}
            </p>
          )}
          {b.izoh && (
            <p className="mt-0.5">
              <span className="font-medium text-zinc-600">Izoh:</span> {b.izoh}
            </p>
          )}
        </div>
      )}

      {bekorQilsaBoladi(b.holat) && (
        <footer className="flex justify-end border-t border-zinc-100 px-5 py-3">
          <CancelOrderButton id={b.id} />
        </footer>
      )}
    </article>
  );
}
