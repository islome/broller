"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Mahsulot } from "@/lib/types";

export type SavatQatori = { mahsulot: Mahsulot; soni: number };

type StoreContext = {
  /** localStorage o'qilib bo'lganini bildiradi (hydration mosligi uchun) */
  tayyor: boolean;
  savat: SavatQatori[];
  sevimlilar: Mahsulot[];
  savatSoni: number;
  sevimliSoni: number;
  savatga: (m: Mahsulot, soni?: number) => void;
  savatdan: (id: string) => void;
  soniOzgartir: (id: string, soni: number) => void;
  sevimliAlmashtir: (m: Mahsulot) => void;
  sevimliMi: (id: string) => boolean;
  savatTozala: () => void;
};

const Ctx = createContext<StoreContext | null>(null);

const SAVAT_KEY = "broller.savat";
const SEVIMLI_KEY = "broller.sevimli";

function oqi<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [savat, setSavat] = useState<SavatQatori[]>([]);
  const [sevimlilar, setSevimlilar] = useState<Mahsulot[]>([]);
  const [tayyor, setTayyor] = useState(false);

  // Boshlang'ich holatni localStorage'dan bir marta o'qiymiz
  useEffect(() => {
    setSavat(oqi<SavatQatori[]>(SAVAT_KEY) ?? []);
    setSevimlilar(oqi<Mahsulot[]>(SEVIMLI_KEY) ?? []);
    setTayyor(true);
  }, []);

  // O'zgarishlarni saqlaymiz
  useEffect(() => {
    if (tayyor) localStorage.setItem(SAVAT_KEY, JSON.stringify(savat));
  }, [savat, tayyor]);
  useEffect(() => {
    if (tayyor) localStorage.setItem(SEVIMLI_KEY, JSON.stringify(sevimlilar));
  }, [sevimlilar, tayyor]);

  const savatga = useCallback((m: Mahsulot, soni = 1) => {
    setSavat((oldin) => {
      const bor = oldin.find((q) => q.mahsulot.id === m.id);
      if (bor) {
        return oldin.map((q) =>
          q.mahsulot.id === m.id ? { ...q, soni: q.soni + soni } : q,
        );
      }
      return [...oldin, { mahsulot: m, soni }];
    });
  }, []);

  const savatdan = useCallback((id: string) => {
    setSavat((oldin) => oldin.filter((q) => q.mahsulot.id !== id));
  }, []);

  const soniOzgartir = useCallback((id: string, soni: number) => {
    setSavat((oldin) =>
      soni <= 0
        ? oldin.filter((q) => q.mahsulot.id !== id)
        : oldin.map((q) => (q.mahsulot.id === id ? { ...q, soni } : q)),
    );
  }, []);

  const sevimliAlmashtir = useCallback((m: Mahsulot) => {
    setSevimlilar((oldin) =>
      oldin.some((x) => x.id === m.id)
        ? oldin.filter((x) => x.id !== m.id)
        : [...oldin, m],
    );
  }, []);

  const sevimliMi = useCallback(
    (id: string) => sevimlilar.some((x) => x.id === id),
    [sevimlilar],
  );

  const savatTozala = useCallback(() => setSavat([]), []);

  const value = useMemo<StoreContext>(
    () => ({
      tayyor,
      savat,
      sevimlilar,
      savatSoni: savat.reduce((s, q) => s + q.soni, 0),
      sevimliSoni: sevimlilar.length,
      savatga,
      savatdan,
      soniOzgartir,
      sevimliAlmashtir,
      sevimliMi,
      savatTozala,
    }),
    [
      tayyor,
      savat,
      sevimlilar,
      savatga,
      savatdan,
      soniOzgartir,
      sevimliAlmashtir,
      sevimliMi,
      savatTozala,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore() StoreProvider ichida ishlatilishi kerak");
  return ctx;
}
