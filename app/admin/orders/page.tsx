import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatNarx, formatSana } from "@/lib/format";
import { holatBelgisi } from "@/lib/buyurtma";

type Qator = {
  id: string;
  raqam: number;
  mijoz_ism: string;
  telefon: string;
  holat: string;
  jami: number;
  valyuta: string;
  yaratilgan_vaqt: string;
  elementlar: { soni: number }[];
};

export default async function AdminOrders() {
  const supabase = await createSupabaseServer();
  const { data, count } = await supabase
    .from("buyurtmalar")
    .select(
      "id,raqam,mijoz_ism,telefon,holat,jami,valyuta,yaratilgan_vaqt,elementlar:buyurtma_elementlari(soni)",
      { count: "exact" },
    )
    .order("yaratilgan_vaqt", { ascending: false });

  const buyurtmalar = (data ?? []) as unknown as Qator[];
  const soni = (b: Qator) =>
    (b.elementlar ?? []).reduce((s, e) => s + e.soni, 0);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Buyurtmalar
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Jami <span className="font-semibold text-zinc-900">{count ?? 0}</span>{" "}
          ta buyurtma.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {buyurtmalar.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm text-zinc-500">Hozircha buyurtma yo&apos;q.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  <th className="px-5 py-3">Raqam</th>
                  <th className="px-5 py-3">Mijoz</th>
                  <th className="px-5 py-3">Sana</th>
                  <th className="px-5 py-3">Mahsulot</th>
                  <th className="px-5 py-3">Jami</th>
                  <th className="px-5 py-3">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {buyurtmalar.map((b) => {
                  const st = holatBelgisi(b.holat);
                  return (
                    <tr
                      key={b.id}
                      className="text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${b.id}`}
                          className="font-semibold text-zinc-900 no-underline hover:underline"
                        >
                          #{b.raqam}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-zinc-900">
                          {b.mijoz_ism}
                        </div>
                        <div className="text-xs text-zinc-400">{b.telefon}</div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-zinc-500">
                        {formatSana(b.yaratilgan_vaqt)}
                      </td>
                      <td className="px-5 py-3 tabular-nums">{soni(b)} dona</td>
                      <td className="px-5 py-3 font-medium text-zinc-900">
                        {formatNarx(b.jami, b.valyuta)}
                      </td>
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
      </div>
    </div>
  );
}
