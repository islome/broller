import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export type AdminProfil = {
  id: string;
  toliq_ism: string;
  rol: "xaridor" | "admin";
};

/**
 * Admin sahifalarini himoyalaydi.
 * Kirmagan bo'lsa → /login, admin bo'lmasa → bosh sahifaga yo'naltiradi.
 */
export async function requireAdmin(): Promise<AdminProfil> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");

  const { data: profil } = await supabase
    .from("foydalanuvchilar")
    .select("id,toliq_ism,rol")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil || profil.rol !== "admin") redirect("/");
  return profil as AdminProfil;
}
