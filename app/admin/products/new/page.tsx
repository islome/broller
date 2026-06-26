import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Kategoriya } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";
import { mahsulotQoshish } from "@/app/admin/products/actions";

export default async function YangiMahsulot() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("kategoriyalar")
    .select("id,nomi,slug,tavsif,ikona")
    .eq("faol", true)
    .order("tartib");

  const kategoriyalar = (data ?? []) as Kategoriya[];

  return (
    <div>
      <header className="mb-6">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
          <Link href="/admin/products" className="no-underline hover:text-zinc-700">
            Mahsulotlar
          </Link>
          <span>/</span>
          <span className="text-zinc-700">Yangi</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
          Yangi mahsulot qo&apos;shish
        </h1>
      </header>

      <ProductForm kategoriyalar={kategoriyalar} action={mahsulotQoshish} />
    </div>
  );
}
