import Link from "next/link";
import Image from "next/image";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Kategoriya, Mahsulot } from "@/lib/types";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ProductCard from "@/components/site/ProductCard";

async function getData() {
  try {
    const supabase = await createSupabaseServer();
    const [kat, mah] = await Promise.all([
      supabase
        .from("kategoriyalar")
        .select("id,nomi,slug,tavsif,ikona")
        .eq("faol", true)
        .order("tartib"),
      supabase
        .from("mahsulotlar")
        .select(
          "id,nomi,slug,tavsif,brend,narxi,chegirma_narxi,valyuta,holati,ombor_soni,asosiy_rasm,tavsiya_etilgan,kategoriya:kategoriyalar(nomi,slug)",
        )
        .eq("status", "faol")
        .order("tavsiya_etilgan", { ascending: false })
        .order("yaratilgan_vaqt", { ascending: false })
        .limit(8),
    ]);
    return {
      kategoriyalar: (kat.data ?? []) as Kategoriya[],
      mahsulotlar: (mah.data ?? []) as unknown as Mahsulot[],
    };
  } catch {
    return { kategoriyalar: [] as Kategoriya[], mahsulotlar: [] as Mahsulot[] };
  }
}

const afzalliklar = [
  { t: "Kafolat va servis", d: "Barcha texnikaga rasmiy kafolat va texnik xizmat.", i: "shield" },
  { t: "Tezkor yetkazib berish", d: "O'zbekiston bo'ylab tez va ishonchli yetkazib berish.", i: "truck" },
  { t: "Sifatli texnika", d: "Faqat sinovdan o'tgan, ishonchli brendlar.", i: "star" },
  { t: "Mutaxassis maslahati", d: "Fermangizga mos jihozni tanlashda yordam.", i: "chat" },
];

export default async function Home() {
  const { kategoriyalar, mahsulotlar } = await getData();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Navbar />

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden">
        <Image
          src="/farm2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
          <div className="max-w-2xl text-white">
            <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              Broyler texnikasi marketplace
            </span>
            <h1
              className="mt-5 font-bold leading-[1.05] tracking-[-0.03em]"
              style={{ fontSize: "clamp(34px, 5vw, 60px)" }}
            >
              Broyler fermangiz uchun zamonaviy texnika
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-200">
              Konditsioner, ventilyatsiya, isitish va oziqlantirish tizimlari —
              barchasi bir joyda. Kafolat va mutaxassis maslahati bilan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#mahsulotlar"
                className="rounded-2xl bg-white px-6 py-3.5 text-[15px] font-bold text-zinc-900 no-underline transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Mahsulotlarni ko&apos;rish
              </Link>
              <Link
                href="#aloqa"
                className="rounded-2xl border border-white/30 bg-white/5 px-6 py-3.5 text-[15px] font-bold text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                Bog&apos;lanish
              </Link>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-zinc-200">
              {["Keng assortiment", "Kafolatlangan sifat", "Tezkor yetkazib berish"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
                    <svg width="9" height="9" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══ KATEGORIYALAR ══ */}
      <section id="kategoriyalar" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHead
          kicker="Kategoriyalar"
          title="Kerakli bo'limni tanlang"
          desc="Fermangiz ehtiyojiga mos texnika turlari."
        />
        {kategoriyalar.length === 0 ? (
          <EmptyHint text="Kategoriyalar hali qo'shilmagan. Supabase'da schema.sql va seed.sql ni run qiling." />
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {kategoriyalar.map((k) => (
              <Link
                key={k.id}
                href="#mahsulotlar"
                className="group rounded-2xl border border-zinc-200 bg-white p-5 no-underline transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors group-hover:bg-zinc-700">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </span>
                <h3 className="mt-4 text-base font-semibold text-zinc-900">{k.nomi}</h3>
                {k.tavsif && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{k.tavsif}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ══ MAHSULOTLAR ══ */}
      <section id="mahsulotlar" className="bg-zinc-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHead
            kicker="Tavsiya etilgan"
            title="Ommabop mahsulotlar"
            desc="Fermerlar eng ko'p tanlayotgan texnika."
          />
          {mahsulotlar.length === 0 ? (
            <EmptyHint text="Mahsulotlar hali yo'q. Supabase'da seed.sql ni run qiling yoki admin sifatida qo'shing." />
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {mahsulotlar.map((m) => (
                <ProductCard key={m.id} mahsulot={m} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ NEGA BROLLER ══ */}
      <section id="nega-broller" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHead
          kicker="Nega Broller"
          title="Ishonchli hamkor"
          desc="Texnika tanlashdan to xizmat ko'rsatishgacha — biz yoningizdamiz."
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {afzalliklar.map((a) => (
            <div key={a.t} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                <FeatureIcon name={a.i} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-900">{a.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ ALOQA / CTA ══ */}
      <section id="aloqa" className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-zinc-900 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="grid items-center gap-8 md:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="font-bold leading-tight tracking-tight" style={{ fontSize: "clamp(26px, 3vw, 38px)" }}>
                Texnika tanlashda yordam kerakmi?
              </h2>
              <p className="mt-3 max-w-md text-zinc-300">
                Mutaxassislarimiz fermangizga mos jihozni tanlashda yordam beradi.
                Bog&apos;laning — narx va shartlarni muhokama qilamiz.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+998901234567"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-[15px] font-bold text-zinc-900 no-underline transition-transform hover:-translate-y-0.5"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                +998 (90) 123-45-67
              </a>
              <a
                href="https://t.me/justislombek"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-6 py-3.5 text-[15px] font-bold text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                Telegram orqali yozish
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionHead({ kicker, title, desc }: { kicker: string; title: string; desc: string }) {
  return (
    <div className="max-w-xl">
      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{kicker}</span>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">{title}</h2>
      <p className="mt-2 text-zinc-500">{desc}</p>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const common = { width: 20, height: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.8, viewBox: "0 0 24 24" } as const;
  if (name === "shield")
    return (<svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
  if (name === "truck")
    return (<svg {...common}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>);
  if (name === "star")
    return (<svg {...common}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
  return (<svg {...common}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>);
}
