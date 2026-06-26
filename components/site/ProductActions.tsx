"use client";

import { useState } from "react";
import type { Mahsulot } from "@/lib/types";
import { useStore } from "@/components/site/StoreProvider";
import CheckoutButton from "@/components/site/CheckoutButton";

export default function ProductActions({ mahsulot }: { mahsulot: Mahsulot }) {
  const { savatga, sevimliAlmashtir, sevimliMi, tayyor } = useStore();
  const [soni, setSoni] = useState(1);
  const [qoshildi, setQoshildi] = useState(false);

  const tugagan = mahsulot.ombor_soni === 0;
  const sevimli = tayyor && sevimliMi(mahsulot.id);
  const max = Math.max(1, mahsulot.ombor_soni);

  function qoshish() {
    if (tugagan) return;
    savatga(mahsulot, soni);
    setQoshildi(true);
    window.setTimeout(() => setQoshildi(false), 1600);
  }

  return (
    <div className="mt-6">
      {/* soni + sevimli */}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-zinc-300">
          <button
            type="button"
            aria-label="Kamaytirish"
            disabled={tugagan || soni <= 1}
            onClick={() => setSoni((n) => Math.max(1, n - 1))}
            className="inline-flex h-11 w-11 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-900 disabled:opacity-40"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="w-10 text-center text-sm font-semibold tabular-nums">
            {soni}
          </span>
          <button
            type="button"
            aria-label="Ko'paytirish"
            disabled={tugagan || soni >= max}
            onClick={() => setSoni((n) => Math.min(max, n + 1))}
            className="inline-flex h-11 w-11 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-900 disabled:opacity-40"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={() => sevimliAlmashtir(mahsulot)}
          aria-pressed={sevimli}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 text-zinc-700 transition-colors hover:bg-zinc-100"
          aria-label={sevimli ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={sevimli ? "#e11d48" : "none"}
            stroke={sevimli ? "#e11d48" : "currentColor"}
            strokeWidth="1.8"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>

      {/* asosiy harakatlar */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={qoshish}
          disabled={tugagan}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {qoshildi ? (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Savatga qo&apos;shildi
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Savatga qo&apos;shish
            </>
          )}
        </button>

        {tugagan ? (
          <button
            type="button"
            disabled
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-zinc-100 px-5 py-3.5 text-sm font-semibold text-zinc-400"
          >
            Omborda yo&apos;q
          </button>
        ) : (
          <CheckoutButton
            target="/#aloqa"
            redirectTo="/cart"
            onBeforeCheckout={() => savatga(mahsulot, soni)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
          >
            Hoziroq sotib olish
          </CheckoutButton>
        )}
      </div>

      {tugagan && (
        <p className="mt-3 text-sm text-zinc-500">
          Bu mahsulot hozircha omborda yo&apos;q. Mavjudligini bilish uchun biz
          bilan bog&apos;laning.
        </p>
      )}
    </div>
  );
}
