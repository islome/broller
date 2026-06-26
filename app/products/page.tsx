import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Kategoriya, Mahsulot } from "@/lib/types";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ProductCard from "@/components/site/ProductCard";

export const metadata: Metadata = {
  title: "Mahsulotlar — Broller",
  description:
    "Broyler fermangiz uchun zamonaviy texnika: iqlim nazorati, ventilyatsiya, isitish, oziqlantirish va boshqalar.",
};

async function getData(katSlug: string | null) {
  try {
    const supabase = await createSupabaseServer();

    const { data: katlar } = await supabase
      .from("kategoriyalar")
      .select("id,nomi,slug,tavsif,ikona")
      .eq("faol", true)
      .order("tartib");

    const kategoriyalar = (katlar ?? []) as Kategoriya[];
    const aktiv = katSlug
      ? (kategoriyalar.find((k) => k.slug === katSlug) ?? null)
      : null;

    let sorov = supabase
      .from("mahsulotlar")
      .select(
        "id,nomi,slug,tavsif,brend,narxi,chegirma_narxi,valyuta,holati,ombor_soni,asosiy_rasm,tavsiya_etilgan,kategoriya:kategoriyalar(nomi,slug)",
      )
      .eq("status", "faol")
      .order("tavsiya_etilgan", { ascending: false })
      .order("yaratilgan_vaqt", { ascending: false });

    if (aktiv) sorov = sorov.eq("kategoriya_id", aktiv.id);

    const { data: mahlar } = await sorov;

    return {
      kategoriyalar,
      mahsulotlar: (mahlar ?? []) as unknown as Mahsulot[],
      aktivKat: aktiv,
    };
  } catch {
    return {
      kategoriyalar: [] as Kategoriya[],
      mahsulotlar: [] as Mahsulot[],
      aktivKat: null as Kategoriya | null,
    };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const katSlug = typeof sp.kategoriya === "string" ? sp.kategoriya : null;
  const { kategoriyalar, mahsulotlar, aktivKat } = await getData(katSlug);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Navbar />

      {/* ══ SARLAVHA + FILTR ══ */}
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <Link href="/" className="no-underline hover:text-zinc-700">
              Bosh sahifa
            </Link>
            <span>/</span>
            <span className="text-zinc-700">Mahsulotlar</span>
          </nav>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {aktivKat ? aktivKat.nomi : "Barcha mahsulotlar"}
          </h1>
          <p className="mt-2 max-w-xl text-zinc-500">
            {aktivKat?.tavsif ??
              "Broyler fermangiz uchun zamonaviy texnika — barchasi bir joyda, kafolat bilan."}
          </p>

          {/* kategoriya filtri */}
          <div className="mt-6 flex flex-wrap gap-2">
            <FilterChip href="/products" active={!aktivKat}>
              Barchasi
            </FilterChip>
            {kategoriyalar.map((k) => (
              <FilterChip
                key={k.id}
                href={`/products?kategoriya=${k.slug}`}
                active={aktivKat?.slug === k.slug}
              >
                {k.nomi}
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MAHSULOTLAR (3 ustun) ══ */}
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <p className="text-sm text-zinc-500">
          <span className="font-semibold text-zinc-900">
            {mahsulotlar.length}
          </span>{" "}
          ta mahsulot topildi
        </p>

        {mahsulotlar.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">
              Bu bo&apos;limda hozircha mahsulot yo&apos;q.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-zinc-800"
            >
              Barcha mahsulotlar
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mahsulotlar.map((m) => (
              <ProductCard key={m.id} mahsulot={m} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white no-underline"
          : "rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 no-underline transition-colors hover:border-zinc-400 hover:bg-zinc-100"
      }
    >
      {children}
    </Link>
  );
}
