"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

export type BekorNatija = { ok: boolean; error?: string };

/** Xaridor o'z buyurtmasini bekor qiladi (ombor trigger orqali avtomatik qaytadi). */
export async function buyurtmaBekorQil(id: string): Promise<BekorNatija> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tizimga kiring." };

  const { error } = await supabase.rpc("buyurtma_bekor_qil", { p_id: id });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/orders/archive");
  revalidatePath("/admin");
  return { ok: true };
}
