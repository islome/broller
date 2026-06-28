"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slug";

export type FormHolat = { error: string | null };

const HOLATLAR = ["yangi", "ishlatilgan", "tamirlangan"];
const STATUSLAR = ["qoralama", "faol", "tugagan", "arxivlangan"];

type MahsulotYozuv = {
  nomi: string;
  slug: string;
  kategoriya_id: string | null;
  brend: string | null;
  model: string | null;
  artikul: string | null;
  narxi: number;
  chegirma_narxi: number | null;
  valyuta: string;
  holati: string;
  status: string;
  ombor_soni: number;
  kafolat_oylari: number;
  asosiy_rasm: string | null;
  tavsif: string | null;
  tavsiya_etilgan: boolean;
  xususiyatlar: Record<string, unknown>;
};

type OqishNatija =
  | { ok: true; data: MahsulotYozuv; rasmlar: string[] }
  | { ok: false; error: string };

/** "rasmlar" yashirin maydonidan rasm URL'lari massivini o'qiydi (eng ko'pi 3 ta). */
function rasmlarniOqi(formData: FormData): string[] {
  const raw = String(formData.get("rasmlar") || "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((u): u is string => typeof u === "string" && u.trim() !== "")
      .slice(0, 3);
  } catch {
    return [];
  }
}

/** FormData'dan mahsulot maydonlarini o'qiydi va tekshiradi (qo'shish/tahrir uchun umumiy). */
function oqi(formData: FormData): OqishNatija {
  const nomi = String(formData.get("nomi") ?? "").trim();
  if (!nomi) return { ok: false, error: "Mahsulot nomini kiriting." };

  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(nomi);
  if (!slug)
    return { ok: false, error: "Slug yaratib bo'lmadi — uni qo'lda kiriting." };

  const narxi = Number(formData.get("narxi"));
  if (!Number.isFinite(narxi) || narxi < 0)
    return { ok: false, error: "Narx noto'g'ri kiritildi." };

  const chegirmaRaw = String(formData.get("chegirma_narxi") ?? "").trim();
  const chegirma_narxi = chegirmaRaw ? Number(chegirmaRaw) : null;
  if (
    chegirma_narxi !== null &&
    (!Number.isFinite(chegirma_narxi) ||
      chegirma_narxi < 0 ||
      chegirma_narxi > narxi)
  )
    return { ok: false, error: "Chegirma narxi 0 dan narxgacha bo'lishi kerak." };

  const ombor_soni = Math.max(
    0,
    Math.trunc(Number(formData.get("ombor_soni") || 0)),
  );
  const kafolat_oylari = Math.max(
    0,
    Math.trunc(Number(formData.get("kafolat_oylari") || 0)),
  );

  const holatiRaw = String(formData.get("holati") || "yangi");
  const holati = HOLATLAR.includes(holatiRaw) ? holatiRaw : "yangi";
  const statusRaw = String(formData.get("status") || "faol");
  const status = STATUSLAR.includes(statusRaw) ? statusRaw : "faol";

  let xususiyatlar: Record<string, unknown> = {};
  const xRaw = String(formData.get("xususiyatlar") || "").trim();
  if (xRaw) {
    try {
      const parsed = JSON.parse(xRaw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        xususiyatlar = parsed as Record<string, unknown>;
      } else {
        return {
          ok: false,
          error: 'Xususiyatlar JSON obyekt bo\'lishi kerak: {"kalit":"qiymat"}',
        };
      }
    } catch {
      return { ok: false, error: "Xususiyatlar JSON formati noto'g'ri." };
    }
  }

  const rasmlar = rasmlarniOqi(formData);

  return {
    ok: true,
    rasmlar,
    data: {
      nomi,
      slug,
      kategoriya_id: String(formData.get("kategoriya_id") || "") || null,
      brend: String(formData.get("brend") || "").trim() || null,
      model: String(formData.get("model") || "").trim() || null,
      artikul: String(formData.get("artikul") || "").trim() || null,
      narxi,
      chegirma_narxi,
      valyuta: String(formData.get("valyuta") || "UZS").trim() || "UZS",
      holati,
      status,
      ombor_soni,
      kafolat_oylari,
      // birinchi rasm — asosiy (ro'yxat/savat/buyurtmalarda ishlatiladi)
      asosiy_rasm: rasmlar[0] ?? null,
      tavsif: String(formData.get("tavsif") || "").trim() || null,
      tavsiya_etilgan: formData.get("tavsiya_etilgan") === "on",
      xususiyatlar,
    },
  };
}

function xatoMatni(error: { code?: string; message: string }): string {
  if (error.code === "23505")
    return "Bu slug allaqachon mavjud. Boshqa slug kiriting.";
  return error.message;
}

export async function mahsulotQoshish(
  _prev: FormHolat,
  formData: FormData,
): Promise<FormHolat> {
  await requireAdmin();
  const p = oqi(formData);
  if (!p.ok) return { error: p.error };

  const supabase = await createSupabaseServer();
  const { data: yangi, error } = await supabase
    .from("mahsulotlar")
    .insert(p.data)
    .select("id")
    .single();
  if (error) return { error: xatoMatni(error) };

  // galereya rasmlari (asosiy rasm mahsulot qatorida ham saqlanadi)
  if (yangi && p.rasmlar.length) {
    await supabase.from("mahsulot_rasmlari").insert(
      p.rasmlar.map((url, i) => ({
        mahsulot_id: yangi.id,
        rasm_url: url,
        tartib: i,
      })),
    );
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function mahsulotYangilash(
  id: string,
  _prev: FormHolat,
  formData: FormData,
): Promise<FormHolat> {
  await requireAdmin();
  const p = oqi(formData);
  if (!p.ok) return { error: p.error };

  const supabase = await createSupabaseServer();
  const { error } = await supabase
    .from("mahsulotlar")
    .update(p.data)
    .eq("id", id);
  if (error) return { error: xatoMatni(error) };

  // galereyani sinxronlaymiz: eskisini o'chirib, joriy ro'yxatni qayta yozamiz
  await supabase.from("mahsulot_rasmlari").delete().eq("mahsulot_id", id);
  if (p.rasmlar.length) {
    await supabase.from("mahsulot_rasmlari").insert(
      p.rasmlar.map((url, i) => ({
        mahsulot_id: id,
        rasm_url: url,
        tartib: i,
      })),
    );
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath(`/products/${p.data.slug}`);
  revalidatePath("/");
  redirect("/admin/products");
}

export async function mahsulotOchirish(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createSupabaseServer();
  // mahsulot_rasmlari FK "on delete cascade" — galereya rasmlari ham o'chadi
  const { error } = await supabase.from("mahsulotlar").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");
}
