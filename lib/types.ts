export type Kategoriya = {
  id: string;
  nomi: string;
  slug: string;
  tavsif: string | null;
  ikona: string | null;
};

export type Mahsulot = {
  id: string;
  nomi: string;
  slug: string;
  tavsif: string | null;
  brend: string | null;
  narxi: number;
  chegirma_narxi: number | null;
  valyuta: string;
  holati: "yangi" | "ishlatilgan" | "tamirlangan";
  ombor_soni: number;
  asosiy_rasm: string | null;
  tavsiya_etilgan: boolean;
  kategoriya: { nomi: string; slug: string } | null;
};

export type MahsulotRasm = {
  id: string;
  rasm_url: string;
  alt_matn: string | null;
  tartib: number;
};

/** Mahsulot sahifasi uchun to'liq ma'lumot (galereya bilan). */
export type MahsulotToliq = Mahsulot & {
  model: string | null;
  artikul: string | null;
  kafolat_oylari: number;
  rasmlar: MahsulotRasm[];
};

export type BuyurtmaHolat =
  | "yangi"
  | "tasdiqlandi"
  | "jonatildi"
  | "yetkazildi"
  | "bekor_qilindi";

export type BuyurtmaElement = {
  id: string;
  mahsulot_id: string | null;
  mahsulot_nomi: string;
  mahsulot_slug: string | null;
  asosiy_rasm: string | null;
  birlik_narx: number;
  soni: number;
  valyuta: string;
};

export type Buyurtma = {
  id: string;
  raqam: number;
  holat: BuyurtmaHolat;
  yetkazish_usuli: "yetkazib_berish" | "olib_ketish";
  tolov_turi: "naqd" | "karta";
  mijoz_ism: string;
  telefon: string;
  viloyat: string | null;
  manzil: string | null;
  izoh: string | null;
  valyuta: string;
  jami: number;
  yaratilgan_vaqt: string;
  elementlar?: BuyurtmaElement[];
};
