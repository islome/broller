"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import CheckoutButton from "@/components/site/CheckoutButton";
import CheckoutModal from "@/components/site/CheckoutModal";
import { useStore } from "@/components/site/StoreProvider";
import { formatNarx } from "@/lib/format";

/** Qatordagi birlik narxi (chegirma bo'lsa — chegirma narxi) */
function birlikNarx(m: {
  narxi: number;
  chegirma_narxi: number | null;
}): number {
  return m.chegirma_narxi && m.chegirma_narxi < m.narxi
    ? m.chegirma_narxi
    : m.narxi;
}

export default function CartPage() {
  const { savat, soniOzgartir, savatdan, savatTozala, savatSoni, tayyor } =
    useStore();

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const valyuta = savat[0]?.mahsulot.valyuta ?? "UZS";
  const jami = savat.reduce(
    (s, q) => s + birlikNarx(q.mahsulot) * q.soni,
    0,
  );

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Navbar />

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
          <Link href="/" className="no-underline hover:text-zinc-700">
            Bosh sahifa
          </Link>
          <span>/</span>
          <span className="text-zinc-700">Savat</span>
        </nav>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Savat
        </h1>
        <p className="mt-2 text-zinc-500">
          {tayyor && savatSoni > 0
            ? `${savatSoni} ta mahsulot tanlandi.`
            : "Buyurtmangizni shu yerda rasmiylashtiring."}
        </p>

        {!tayyor ? null : savat.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* qatorlar */}
            <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200">
              {savat.map(({ mahsulot, soni }) => (
                <div
                  key={mahsulot.id}
                  className="flex gap-4 p-4 sm:items-center"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    <Image
                      src={mahsulot.asosiy_rasm || "/farm1.jpg"}
                      alt={mahsulot.nomi}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {mahsulot.kategoriya && (
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                        {mahsulot.kategoriya.nomi}
                      </span>
                    )}
                    <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900">
                      {mahsulot.nomi}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-zinc-900">
                      {formatNarx(birlikNarx(mahsulot), mahsulot.valyuta)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* soni */}
                    <div className="flex items-center rounded-xl border border-zinc-300">
                      <QtyBtn
                        label="Kamaytirish"
                        onClick={() => soniOzgartir(mahsulot.id, soni - 1)}
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </QtyBtn>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">
                        {soni}
                      </span>
                      <QtyBtn
                        label="Ko'paytirish"
                        onClick={() => soniOzgartir(mahsulot.id, soni + 1)}
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </QtyBtn>
                    </div>
                    <button
                      type="button"
                      onClick={() => savatdan(mahsulot.id)}
                      className="text-xs font-medium text-zinc-400 transition-colors hover:text-rose-600"
                    >
                      O&apos;chirish
                    </button>
                  </div>
                </div>
              ))}

              <div className="p-4">
                <button
                  type="button"
                  onClick={savatTozala}
                  className="text-xs font-medium text-zinc-400 transition-colors hover:text-rose-600"
                >
                  Savatni tozalash
                </button>
              </div>
            </div>

            {/* xulosa */}
            <aside className="h-fit rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Buyurtma xulosasi
              </h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Mahsulotlar ({savatSoni})</dt>
                  <dd className="font-medium text-zinc-900">
                    {formatNarx(jami, valyuta)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Yetkazib berish</dt>
                  <dd className="font-medium text-zinc-700">Kelishuv asosida</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-zinc-200 pt-4">
                <span className="text-sm font-semibold text-zinc-900">Jami</span>
                <span className="text-lg font-bold text-zinc-900">
                  {formatNarx(jami, valyuta)}
                </span>
              </div>
              <CheckoutButton
                redirectTo="/cart"
                onAuthed={() => setCheckoutOpen(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-70"
              >
                Buyurtmani rasmiylashtirish
              </CheckoutButton>
              <Link
                href="/products"
                className="mt-2 flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-600 no-underline transition-colors hover:bg-zinc-100"
              >
                Xaridni davom ettirish
              </Link>
            </aside>
          </div>
        )}
      </section>

      <Footer />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}

function QtyBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-900"
    >
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        {children}
      </svg>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-400 shadow-sm">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </div>
      <p className="mt-4 text-sm text-zinc-500">Savatingiz hozircha bo&apos;sh.</p>
      <Link
        href="/products"
        className="mt-4 inline-block rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-zinc-800"
      >
        Mahsulotlarni ko&apos;rish
      </Link>
    </div>
  );
}
