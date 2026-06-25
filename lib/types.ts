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
