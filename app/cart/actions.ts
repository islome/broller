"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isValidUzPhone } from "@/lib/phone";

export type BuyurtmaKirish = {
  yetkazish: "yetkazib_berish" | "olib_ketish";
  tolov: "naqd" | "karta";
  ism: string;
  telefon: string;
  viloyat: string;
  manzil: string;
  izoh: string;
  elementlar: { mahsulot_id: string; soni: number }[];
};

export type BuyurtmaNatija =
  | { ok: true; id: string; raqam: number }
  | { ok: false; error: string };

/**
 * Checkout — buyurtmani DB'ga saqlaydi.
 * Narxlar va jami serverda `buyurtma_yaratish` RPC ichida DB'dan olinadi
 * (client'dagi narxlarga ishonilmaydi). Atomik: hammasi yoki hech narsa.
 */
export async function buyurtmaBer(
  kirish: BuyurtmaKirish,
): Promise<BuyurtmaNatija> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Buyurtma berish uchun tizimga kiring." };

  const ism = (kirish.ism ?? "").trim();
  if (!ism) return { ok: false, error: "Ism familiyangizni kiriting." };
  if (!isValidUzPhone(kirish.telefon))
    return { ok: false, error: "Telefon raqamni to'g'ri kiriting." };

  const yetkazish =
    kirish.yetkazish === "olib_ketish" ? "olib_ketish" : "yetkazib_berish";
  const viloyat = (kirish.viloyat ?? "").trim();
  const manzil = (kirish.manzil ?? "").trim();
  if (yetkazish === "yetkazib_berish" && (!viloyat || !manzil))
    return {
      ok: false,
      error: "Yetkazib berish uchun viloyat va manzilni kiriting.",
    };

  const elementlar = (kirish.elementlar ?? [])
    .filter((e) => e.mahsulot_id && e.soni > 0)
    .map((e) => ({
      mahsulot_id: e.mahsulot_id,
      soni: Math.max(1, Math.trunc(e.soni)),
    }));
  if (elementlar.length === 0) return { ok: false, error: "Savat bo'sh." };

  const { data, error } = await supabase.rpc("buyurtma_yaratish", {
    p_yetkazish: yetkazish,
    p_tolov: kirish.tolov === "karta" ? "karta" : "naqd",
    p_ism: ism,
    p_telefon: kirish.telefon.trim(),
    p_viloyat: yetkazish === "yetkazib_berish" ? viloyat : null,
    p_manzil: yetkazish === "yetkazib_berish" ? manzil : null,
    p_izoh: (kirish.izoh ?? "").trim() || null,
    p_elementlar: elementlar,
  });

  if (error) return { ok: false, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id)
    return {
      ok: false,
      error: "Buyurtma yaratilmadi. Mahsulotlar mavjudligini tekshiring.",
    };

  revalidatePath("/profile/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true, id: String(row.id), raqam: Number(row.raqam) };
}
