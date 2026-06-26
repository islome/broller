"use client";

import Link from "next/link";
import Image from "next/image";
import type { Mahsulot } from "@/lib/types";
import { formatNarx } from "@/lib/format";
import { useStore } from "@/components/site/StoreProvider";

export default function ProductCard({ mahsulot }: { mahsulot: Mahsulot }) {
  const { savatga, sevimliAlmashtir, sevimliMi, tayyor } = useStore();

  const rasm = mahsulot.asosiy_rasm || "/farm1.jpg";
  const chegirma =
    mahsulot.chegirma_narxi && mahsulot.chegirma_narxi < mahsulot.narxi;
  const tugagan = mahsulot.ombor_soni === 0;
  const sevimli = tayyor && sevimliMi(mahsulot.id);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)]">
      {/* sevimli — Link'dan tashqarida, ichki interaktiv element bo'lmasligi uchun */}
      <button
        type="button"
        onClick={() => sevimliAlmashtir(mahsulot)}
        aria-label={sevimli ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
        aria-pressed={sevimli}
        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-rose-600"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={sevimli ? "#e11d48" : "none"}
          stroke={sevimli ? "#e11d48" : "currentColor"}
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>

      <Link
        href={`/products/${mahsulot.slug}`}
        className="flex flex-col no-underline"
      >
        {/* rasm */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
          <Image
            src={rasm}
            alt={mahsulot.nomi}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {mahsulot.tavsiya_etilgan && (
            <span className="absolute left-3 top-3 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white">
              Tavsiya
            </span>
          )}
          {chegirma && (
            <span className="absolute bottom-3 left-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white">
              Chegirma
            </span>
          )}
        </div>

        {/* tana */}
        <div className="flex flex-col p-4">
          {mahsulot.kategoriya && (
            <span className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              {mahsulot.kategoriya.nomi}
            </span>
          )}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
            {mahsulot.nomi}
          </h3>
          {mahsulot.brend && (
            <p className="mt-0.5 text-xs text-zinc-500">{mahsulot.brend}</p>
          )}

          <div className="mt-3 pt-1">
            {chegirma ? (
              <div className="flex items-baseline gap-2">
                <p className="text-base font-bold text-zinc-900">
                  {formatNarx(mahsulot.chegirma_narxi!, mahsulot.valyuta)}
                </p>
                <p className="text-xs text-zinc-400 line-through">
                  {formatNarx(mahsulot.narxi, mahsulot.valyuta)}
                </p>
              </div>
            ) : (
              <p className="text-base font-bold text-zinc-900">
                {formatNarx(mahsulot.narxi, mahsulot.valyuta)}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* harakat */}
      <div className="mt-auto px-4 pb-4">
        <button
          type="button"
          disabled={tugagan}
          onClick={() => savatga(mahsulot)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
        >
          {tugagan ? (
            "Omborda yo'q"
          ) : (
            <>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Savatga
            </>
          )}
        </button>
      </div>
    </article>
  );
}
