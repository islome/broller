"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { BUYURTMA_HOLATLARI } from "@/lib/buyurtma";

const HOLATLAR = BUYURTMA_HOLATLARI.map((h) => h.value);

export type HolatNatija = { error: string | null; ok?: boolean };

export async function buyurtmaHolatYangilash(
  id: string,
  _prev: HolatNatija,
  formData: FormData,
): Promise<HolatNatija> {
  await requireAdmin();

  const holat = String(formData.get("holat") ?? "");
  if (!HOLATLAR.includes(holat as (typeof HOLATLAR)[number]))
    return { error: "Noto'g'ri holat tanlandi." };

  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("buyurtmalar")
    .update({ holat })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/profile/orders");
  return { error: null, ok: true };
}
