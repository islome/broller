"use client";

import { useRef, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

const MAX = 3;
const MAX_BAYT = 5 * 1024 * 1024; // 5 MB
const BUCKET = "mahsulot-rasmlari";

type Element = {
  id: string;
  url: string | null; // null bo'lsa — hali yuklanmoqda
  yuklanmoqda: boolean;
};

/**
 * Mahsulot rasmlarini qurilmadan yuklash (fayl tanlash yoki kamera).
 * Rasmlar darhol Supabase Storage'ga yuklanadi; URL'lar yashirin
 * "rasmlar" maydoni orqali server action'ga JSON massiv sifatida boradi.
 * Birinchi rasm — asosiy rasm.
 */
export default function ProductImagePicker({
  defaultRasmlar = [],
}: {
  defaultRasmlar?: string[];
}) {
  const [elementlar, setElementlar] = useState<Element[]>(() =>
    defaultRasmlar
      .slice(0, MAX)
      .map((url) => ({ id: crypto.randomUUID(), url, yuklanmoqda: false })),
  );
  const [xato, setXato] = useState<string | null>(null);
  const faylInput = useRef<HTMLInputElement>(null);
  const kameraInput = useRef<HTMLInputElement>(null);

  const urllar = elementlar
    .map((e) => e.url)
    .filter((u): u is string => Boolean(u));
  const toluq = elementlar.length >= MAX;

  async function fayllarniQoshish(fayllar: FileList | null) {
    setXato(null);
    if (!fayllar || fayllar.length === 0) return;

    const boshJoy = MAX - elementlar.length;
    if (boshJoy <= 0) {
      setXato(`Eng ko'pi ${MAX} ta rasm yuklash mumkin.`);
      return;
    }

    const tanlangan = Array.from(fayllar);
    const qabul: File[] = [];
    for (const f of tanlangan.slice(0, boshJoy)) {
      if (!f.type.startsWith("image/")) {
        setXato("Faqat rasm fayllarini yuklang.");
        continue;
      }
      if (f.size > MAX_BAYT) {
        setXato("Har bir rasm 5 MB dan oshmasin.");
        continue;
      }
      qabul.push(f);
    }
    if (tanlangan.length > boshJoy) {
      setXato(`Eng ko'pi ${MAX} ta rasm — ortiqchasi o'tkazib yuborildi.`);
    }
    if (qabul.length === 0) return;

    const supabase = createSupabaseBrowser();

    for (const fayl of qabul) {
      const localId = crypto.randomUUID();
      setElementlar((oldingi) => [
        ...oldingi,
        { id: localId, url: null, yuklanmoqda: true },
      ]);

      try {
        const ext = fayl.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, fayl, {
            cacheControl: "3600",
            contentType: fayl.type,
            upsert: false,
          });
        if (uErr) throw uErr;

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        setElementlar((oldingi) =>
          oldingi.map((e) =>
            e.id === localId
              ? { ...e, url: data.publicUrl, yuklanmoqda: false }
              : e,
          ),
        );
      } catch (err) {
        setElementlar((oldingi) => oldingi.filter((e) => e.id !== localId));
        setXato(
          err instanceof Error
            ? `Rasm yuklanmadi: ${err.message}`
            : "Rasm yuklanmadi.",
        );
      }
    }
  }

  function ochirish(id: string) {
    setElementlar((oldingi) => oldingi.filter((e) => e.id !== id));
    setXato(null);
  }

  return (
    <div>
      <input type="hidden" name="rasmlar" value={JSON.stringify(urllar)} />

      <div className="flex flex-wrap items-center gap-3">
        {elementlar.map((el, i) => (
          <div
            key={el.id}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
          >
            {el.yuklanmoqda || !el.url ? (
              <div className="flex h-full w-full items-center justify-center">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="animate-spin text-zinc-400"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              </div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={el.url}
                  alt={`Mahsulot rasmi ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded-md bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Asosiy
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => ochirish(el.id)}
                  aria-label="Rasmni o'chirish"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900/80 text-sm leading-none text-white transition-colors hover:bg-rose-600"
                >
                  &times;
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {!toluq && (
        <div className="mt-3 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => faylInput.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Fayl yuklash
          </button>
          <button
            type="button"
            onClick={() => kameraInput.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Rasmga olish
          </button>
        </div>
      )}

      <input
        ref={faylInput}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          fayllarniQoshish(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={kameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          fayllarniQoshish(e.target.files);
          e.target.value = "";
        }}
      />

      <p className="mt-2 text-xs leading-5 text-zinc-500">
        Qurilmadan yuklang yoki rasmga oling. Eng ko&apos;pi {MAX} ta —
        birinchisi asosiy rasm. JPG, PNG yoki WebP, har biri 5 MB gacha.
        {" "}
        <span className="font-medium text-zinc-600">
          Yuklangan: {urllar.length}/{MAX}
        </span>
      </p>

      {xato && <p className="mt-2 text-xs text-rose-600">{xato}</p>}
    </div>
  );
}
