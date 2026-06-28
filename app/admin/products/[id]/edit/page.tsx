import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Kategoriya } from "@/lib/types";
import ProductForm, { type TahrirMahsulot } from "@/components/admin/ProductForm";
import { mahsulotYangilash } from "@/app/admin/products/actions";

export default async function MahsulotTahrir({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const [{ data: m }, { data: kat }] = await Promise.all([
    supabase
      .from("mahsulotlar")
      .select(
        "id,nomi,slug,kategoriya_id,tavsif,brend,model,artikul,narxi,chegirma_narxi,valyuta,holati,status,ombor_soni,kafolat_oylari,asosiy_rasm,tavsiya_etilgan,rasmlar:mahsulot_rasmlari(rasm_url,tartib)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("kategoriyalar")
      .select("id,nomi,slug,tavsif,ikona")
      .eq("faol", true)
      .order("tartib"),
  ]);

  if (!m) notFound();

  const mahsulot = m as unknown as TahrirMahsulot & { nomi: string };
  const kategoriyalar = (kat ?? []) as Kategoriya[];

  // mavjud galereya rasmlari (tartib bo'yicha); bo'lmasa — eski asosiy rasm
  const galereya = (
    (m as { rasmlar?: { rasm_url: string; tartib: number }[] }).rasmlar ?? []
  )
    .slice()
    .sort((a, b) => a.tartib - b.tartib)
    .map((r) => r.rasm_url);
  const mavjudRasmlar = galereya.length
    ? galereya
    : mahsulot.asosiy_rasm
      ? [mahsulot.asosiy_rasm]
      : [];

  return (
    <div>
      <header className="mb-6">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
          <Link href="/admin/products" className="no-underline hover:text-zinc-700">
            Mahsulotlar
          </Link>
          <span>/</span>
          <span className="text-zinc-700">Tahrirlash</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
          Mahsulotni tahrirlash
        </h1>
        <p className="mt-1 truncate text-sm text-zinc-500">{mahsulot.nomi}</p>
      </header>

      <ProductForm
        kategoriyalar={kategoriyalar}
        action={mahsulotYangilash.bind(null, id)}
        mahsulot={mahsulot}
        mavjudRasmlar={mavjudRasmlar}
      />
    </div>
  );
}
