"use client";

import { useState, useTransition } from "react";
import { mahsulotOchirish } from "@/app/admin/products/actions";

export default function ProductDeleteButton({
  id,
  nomi,
}: {
  id: string;
  nomi: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1" title={nomi}>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => { await mahsulotOchirish(id); })}
          className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
        >
          {pending && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="animate-spin">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {pending ? "O'chirilmoqda" : "O'chirish"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100"
        >
          Yo&apos;q
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label="O'chirish"
      onClick={() => setConfirming(true)}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
    >
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  );
}
