import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Mahsulot, MahsulotToliq } from "@/lib/types";
import { formatNarx } from "@/lib/format";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ProductGallery from "@/components/site/ProductGallery";
import ProductActions from "@/components/site/ProductActions";

const SELECT =
  "id,nomi,slug,tavsif,brend,model,artikul,narxi,chegirma_narxi,valyuta,holati,ombor_soni,kafolat_oylari,xususiyatlar,asosiy_rasm,tavsiya_etilgan,kategoriya:kategoriyalar(nomi,slug),rasmlar:mahsulot_rasmlari(id,rasm_url,alt_matn,tartib)";

// React cache — metadata va sahifa bir so'rovda DB'ga ikki marta bormasligi uchun
const getMahsulot = cache(async (slug: string): Promise<MahsulotToliq | null> => {
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("mahsulotlar")
      .select(SELECT)
      .eq("slug", slug)
      .eq("status", "faol")
      .maybeSingle();
    return (data as unknown as MahsulotToliq) ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = await getMahsulot(slug);
  if (!m) return { title: "Mahsulot topilmadi — Broller" };
  return {
    title: `${m.nomi} — Broller`,
    description: m.tavsif ?? `${m.nomi} — Broller marketplace`,
  };
}

const HOLAT_LABEL: Record<string, string> = {
  yangi: "Yangi",
  ishlatilgan: "Ishlatilgan",
  tamirlangan: "Ta'mirlangan",
};

export default async function MahsulotSahifa({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = await getMahsulot(slug);
  if (!m) notFound();

  const chegirma = m.chegirma_narxi && m.chegirma_narxi < m.narxi;
  const foiz = chegirma
    ? Math.round((1 - m.chegirma_narxi! / m.narxi) * 100)
    : 0;
  const tugagan = m.ombor_soni === 0;

  // galereya: tartib bo'yicha, bo'lmasa asosiy rasm
  const rasmlar = [...(m.rasmlar ?? [])]
    .sort((a, b) => a.tartib - b.tartib)
    .map((r) => r.rasm_url);
  const images = rasmlar.length ? rasmlar : m.asosiy_rasm ? [m.asosiy_rasm] : [];

  const xususiyatlar = Object.entries(m.xususiyatlar ?? {});

  // savat/sevimli uchun toza Mahsulot obyekti
  const kartaMahsulot: Mahsulot = {
    id: m.id,
    nomi: m.nomi,
    slug: m.slug,
    tavsif: m.tavsif,
    brend: m.brend,
    narxi: m.narxi,
    chegirma_narxi: m.chegirma_narxi,
    valyuta: m.valyuta,
    holati: m.holati,
    ombor_soni: m.ombor_soni,
    asosiy_rasm: m.asosiy_rasm,
    tavsiya_etilgan: m.tavsiya_etilgan,
    kategoriya: m.kategoriya,
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Navbar />

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-zinc-400">
          <Link href="/" className="no-underline hover:text-zinc-700">
            Bosh sahifa
          </Link>
          <span>/</span>
          <Link href="/products" className="no-underline hover:text-zinc-700">
            Mahsulotlar
          </Link>
          {m.kategoriya && (
            <>
              <span>/</span>
              <Link
                href={`/products?kategoriya=${m.kategoriya.slug}`}
                className="no-underline hover:text-zinc-700"
              >
                {m.kategoriya.nomi}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-zinc-700">{m.nomi}</span>
        </nav>

        {/* asosiy: galereya + ma'lumot */}
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={images} alt={m.nomi} />

          <div>
            {m.kategoriya && (
              <Link
                href={`/products?kategoriya=${m.kategoriya.slug}`}
                className="text-xs font-semibold uppercase tracking-wide text-zinc-400 no-underline hover:text-zinc-700"
              >
                {m.kategoriya.nomi}
              </Link>
            )}

            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {m.nomi}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
              {m.brend && (
                <span>
                  Brend: <span className="font-medium text-zinc-700">{m.brend}</span>
                </span>
              )}
              {m.model && (
                <span>
                  Model: <span className="font-medium text-zinc-700">{m.model}</span>
                </span>
              )}
            </div>

            {/* narx */}
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">
                {formatNarx(chegirma ? m.chegirma_narxi! : m.narxi, m.valyuta)}
              </span>
              {chegirma && (
                <>
                  <span className="text-lg text-zinc-400 line-through">
                    {formatNarx(m.narxi, m.valyuta)}
                  </span>
                  <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">
                    −{foiz}%
                  </span>
                </>
              )}
            </div>

            {/* holat chiplari */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700">
                {HOLAT_LABEL[m.holati] ?? m.holati}
              </span>
              {tugagan ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600">
                  Omborda yo&apos;q
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Omborda mavjud ({m.ombor_soni} dona)
                </span>
              )}
              {m.kafolat_oylari > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700">
                  Kafolat: {m.kafolat_oylari} oy
                </span>
              )}
            </div>

            {m.tavsif && (
              <p className="mt-5 text-[15px] leading-relaxed text-zinc-600">
                {m.tavsif}
              </p>
            )}

            {/* harakatlar (savat / sotib olish / sevimli) */}
            <ProductActions mahsulot={kartaMahsulot} />

            {m.artikul && (
              <p className="mt-5 text-xs text-zinc-400">Artikul: {m.artikul}</p>
            )}
          </div>
        </div>

        {/* texnik xususiyatlar */}
        {xususiyatlar.length > 0 && (
          <section className="mt-14 max-w-3xl">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900">
              Texnik xususiyatlar
            </h2>
            <dl className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
              {xususiyatlar.map(([kalit, qiymat], idx) => (
                <div
                  key={kalit}
                  className={`flex items-center justify-between gap-4 px-5 py-3.5 text-sm ${
                    idx % 2 === 1 ? "bg-zinc-50" : "bg-white"
                  }`}
                >
                  <dt className="text-zinc-500">{xususiyatLabel(kalit)}</dt>
                  <dd className="text-right font-medium text-zinc-900">
                    {xususiyatQiymat(qiymat)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}

/** "quvvat_kw" → "Quvvat kw" */
function xususiyatLabel(kalit: string): string {
  const s = kalit.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function xususiyatQiymat(qiymat: string | number | boolean | null): string {
  if (typeof qiymat === "boolean") return qiymat ? "Ha" : "Yo'q";
  if (qiymat === null) return "—";
  return String(qiymat);
}
