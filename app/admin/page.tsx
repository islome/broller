import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatNarx, formatSana } from "@/lib/format";
import { holatBelgisi } from "@/lib/buyurtma";

type Qator = {
  nomi: string;
  slug: string;
  narxi: number;
  chegirma_narxi: number | null;
  ombor_soni: number;
  status: string;
};

type BuyurtmaQator = {
  id: string;
  raqam: number;
  mijoz_ism: string;
  holat: string;
  jami: number;
  valyuta: string;
  yaratilgan_vaqt: string;
};

export default async function AdminHome() {
  const supabase = await createSupabaseServer();

  const [
    { count: userlarSoni },
    { data: mahlar },
    { data: oxirgiBuyurtmalar, count: buyurtmalarSoni },
  ] = await Promise.all([
    supabase
      .from("foydalanuvchilar")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("mahsulotlar")
      .select("nomi,slug,narxi,chegirma_narxi,ombor_soni,status"),
    supabase
      .from("buyurtmalar")
      .select("id,raqam,mijoz_ism,holat,jami,valyuta,yaratilgan_vaqt", {
        count: "exact",
      })
      .order("yaratilgan_vaqt", { ascending: false })
      .limit(5),
  ]);

  const buyurtmalar = (oxirgiBuyurtmalar ?? []) as BuyurtmaQator[];

  const mahsulotlar = (mahlar ?? []) as Qator[];
  const birlik = (m: Qator) =>
    m.chegirma_narxi && m.chegirma_narxi < m.narxi ? m.chegirma_narxi : m.narxi;

  const faol = mahsulotlar.filter((m) => m.status === "faol");
  const potensialDaromad = mahsulotlar.reduce(
    (s, m) => s + birlik(m) * (m.ombor_soni || 0),
    0,
  );
  const omborBirliklari = mahsulotlar.reduce(
    (s, m) => s + (m.ombor_soni || 0),
    0,
  );
  const tugagan = mahsulotlar.filter((m) => (m.ombor_soni || 0) === 0);
  const kamQolgan = mahsulotlar.filter(
    (m) => (m.ombor_soni || 0) > 0 && (m.ombor_soni || 0) <= 5,
  );

  const omborTartibi = [...mahsulotlar]
    .sort((a, b) => (a.ombor_soni || 0) - (b.ombor_soni || 0))
    .slice(0, 8);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Boshqaruv paneli
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Do&apos;kon ko&apos;rsatkichlari va ombor holati.
        </p>
      </header>

      {/* statistika kartochkalari */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Foydalanuvchilar"
          value={String(userlarSoni ?? 0)}
          hint="Ro'yxatdan o'tganlar"
          icon="users"
        />
        <StatCard
          label="Mahsulotlar"
          value={String(mahsulotlar.length)}
          hint={`${faol.length} ta faol`}
          icon="box"
        />
        <StatCard
          label="Potensial daromad"
          value={formatNarx(potensialDaromad)}
          hint="narx × ombordagi soni"
          icon="cash"
        />
        <StatCard
          label="Ombordagi birliklar"
          value={String(omborBirliklari)}
          hint={`${tugagan.length} tugagan · ${kamQolgan.length} kam qolgan`}
          icon="layers"
        />
      </div>

      {/* so'nggi buyurtmalar */}
      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">
              So&apos;nggi buyurtmalar
            </h2>
            <p className="text-xs text-zinc-500">
              Jami {buyurtmalarSoni ?? 0} ta buyurtma.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-zinc-600 no-underline hover:text-zinc-900"
          >
            Barchasi →
          </Link>
        </div>

        {buyurtmalar.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            Hozircha buyurtma yo&apos;q.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  <th className="px-5 py-3 font-semibold">Raqam</th>
                  <th className="px-5 py-3 font-semibold">Mijoz</th>
                  <th className="px-5 py-3 font-semibold">Sana</th>
                  <th className="px-5 py-3 font-semibold">Jami</th>
                  <th className="px-5 py-3 font-semibold">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {buyurtmalar.map((b) => {
                  const st = holatBelgisi(b.holat);
                  return (
                    <tr key={b.id} className="text-zinc-700">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${b.id}`}
                          className="font-semibold text-zinc-900 no-underline hover:underline"
                        >
                          #{b.raqam}
                        </Link>
                      </td>
                      <td className="max-w-[180px] truncate px-5 py-3 font-medium text-zinc-900">
                        {b.mijoz_ism}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-zinc-500">
                        {formatSana(b.yaratilgan_vaqt)}
                      </td>
                      <td className="px-5 py-3">{formatNarx(b.jami, b.valyuta)}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${st.c}`}
                        >
                          {st.t}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ombor holati */}
      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Ombor holati</h2>
            <p className="text-xs text-zinc-500">
              Eng kam qolgan mahsulotlar birinchi.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="text-sm font-semibold text-zinc-600 no-underline hover:text-zinc-900"
          >
            Barchasi →
          </Link>
        </div>

        {omborTartibi.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            Hozircha mahsulot yo&apos;q.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  <th className="px-5 py-3 font-semibold">Mahsulot</th>
                  <th className="px-5 py-3 font-semibold">Narx</th>
                  <th className="px-5 py-3 font-semibold">Ombor</th>
                  <th className="px-5 py-3 font-semibold">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {omborTartibi.map((m) => {
                  const soni = m.ombor_soni || 0;
                  const holat =
                    soni === 0
                      ? { t: "Tugagan", c: "bg-rose-50 text-rose-600" }
                      : soni <= 5
                        ? { t: "Kam qolgan", c: "bg-amber-50 text-amber-700" }
                        : { t: "Yetarli", c: "bg-emerald-50 text-emerald-700" };
                  return (
                    <tr key={m.slug} className="text-zinc-700">
                      <td className="max-w-[260px] truncate px-5 py-3 font-medium text-zinc-900">
                        {m.nomi}
                      </td>
                      <td className="px-5 py-3">{formatNarx(birlik(m))}</td>
                      <td className="px-5 py-3 tabular-nums">{soni} dona</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${holat.c}`}
                        >
                          {holat.t}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
          <StatIcon name={icon} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

function StatIcon({ name }: { name: string }) {
  const c = {
    width: 16,
    height: 16,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  } as const;
  if (name === "users")
    return (
      <svg {...c}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    );
  if (name === "cash")
    return (
      <svg {...c}>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  if (name === "layers")
    return (
      <svg {...c}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    );
  return (
    <svg {...c}>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
