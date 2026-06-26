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

/** Mahsulot sahifasi uchun to'liq ma'lumot (galereya + texnik xususiyatlar). */
export type MahsulotToliq = Mahsulot & {
  model: string | null;
  artikul: string | null;
  kafolat_oylari: number;
  xususiyatlar: Record<string, string | number | boolean | null>;
  rasmlar: MahsulotRasm[];
};
