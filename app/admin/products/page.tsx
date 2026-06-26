import Link from "next/link";
import Image from "next/image";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatNarx } from "@/lib/format";
import ProductDeleteButton from "@/components/admin/ProductDeleteButton";

type Qator = {
  id: string;
  nomi: string;
  slug: string;
  narxi: number;
  chegirma_narxi: number | null;
  valyuta: string;
  ombor_soni: number;
  status: string;
  asosiy_rasm: string | null;
  kategoriya: { nomi: string } | null;
};

const STATUS: Record<string, { t: string; c: string }> = {
  faol: { t: "Faol", c: "bg-emerald-50 text-emerald-700" },
  qoralama: { t: "Qoralama", c: "bg-zinc-100 text-zinc-600" },
  tugagan: { t: "Tugagan", c: "bg-rose-50 text-rose-600" },
  arxivlangan: { t: "Arxivlangan", c: "bg-zinc-100 text-zinc-500" },
};

export default async function AdminProducts() {
  const supabase = await createSupabaseServer();
  const { data, count } = await supabase
    .from("mahsulotlar")
    .select(
      "id,nomi,slug,narxi,chegirma_narxi,valyuta,ombor_soni,status,asosiy_rasm,kategoriya:kategoriyalar(nomi)",
      { count: "exact" },
    )
    .order("yaratilgan_vaqt", { ascending: false });

  const mahsulotlar = (data ?? []) as unknown as Qator[];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Mahsulotlar
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Jami{" "}
            <span className="font-semibold text-zinc-900">{count ?? 0}</span> xil
            mahsulot.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-zinc-800"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yangi mahsulot
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {mahsulotlar.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm text-zinc-500">Hozircha mahsulot yo&apos;q.</p>
            <Link
              href="/admin/products/new"
              className="mt-4 inline-block rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-zinc-800"
            >
              Birinchi mahsulotni qo&apos;shish
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  <th className="px-5 py-3">Mahsulot</th>
                  <th className="px-5 py-3">Kategoriya</th>
                  <th className="px-5 py-3">Narx</th>
                  <th className="px-5 py-3">Ombor</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {mahsulotlar.map((m) => {
                  const st = STATUS[m.status] ?? {
                    t: m.status,
                    c: "bg-zinc-100 text-zinc-600",
                  };
                  return (
                    <tr key={m.id} className="text-zinc-700">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                            <Image
                              src={m.asosiy_rasm || "/farm1.jpg"}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <Link
                            href={`/products/${m.slug}`}
                            className="max-w-[240px] truncate font-medium text-zinc-900 no-underline hover:underline"
                          >
                            {m.nomi}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-3">{m.kategoriya?.nomi ?? "—"}</td>
                      <td className="px-5 py-3">{formatNarx(m.narxi, m.valyuta)}</td>
                      <td className="px-5 py-3 tabular-nums">{m.ombor_soni}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${st.c}`}
                        >
                          {st.t}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <ProductDeleteButton id={m.id} nomi={m.nomi} />
                          <Link
                            href={`/admin/products/${m.id}/edit`}
                            aria-label="Tahrirlash"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                          >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
