import type { BuyurtmaHolat } from "@/lib/types";

/** Buyurtma holatlari — admin tanlovi va badge ranglari uchun tartibda. */
export const BUYURTMA_HOLATLARI: { value: BuyurtmaHolat; t: string; c: string }[] = [
  { value: "yangi", t: "Yangi", c: "bg-amber-50 text-amber-700" },
  { value: "tasdiqlandi", t: "Tasdiqlandi", c: "bg-blue-50 text-blue-700" },
  { value: "jonatildi", t: "Jo'natildi", c: "bg-indigo-50 text-indigo-700" },
  { value: "yetkazildi", t: "Yetkazildi", c: "bg-emerald-50 text-emerald-700" },
  { value: "bekor_qilindi", t: "Bekor qilindi", c: "bg-rose-50 text-rose-600" },
];

const HOLAT_MAP = Object.fromEntries(
  BUYURTMA_HOLATLARI.map((h) => [h.value, h]),
) as Record<string, { value: BuyurtmaHolat; t: string; c: string }>;

export function holatBelgisi(holat: string): { t: string; c: string } {
  return HOLAT_MAP[holat] ?? { t: holat, c: "bg-zinc-100 text-zinc-600" };
}

/** Xaridor faqat shu holatlardagi buyurtmani bekor qila oladi. */
export const BEKOR_QILSA_BOLADI: BuyurtmaHolat[] = ["yangi", "tasdiqlandi"];

export function bekorQilsaBoladi(holat: string): boolean {
  return BEKOR_QILSA_BOLADI.includes(holat as BuyurtmaHolat);
}

export function yetkazishMatni(usul: string): string {
  return usul === "olib_ketish" ? "Olib ketish" : "Yetkazib berish";
}

export function tolovMatni(turi: string): string {
  return turi === "karta" ? "Karta" : "Naqd pul";
}
