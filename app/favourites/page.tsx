"use client";

import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ProductCard from "@/components/site/ProductCard";
import { useStore } from "@/components/site/StoreProvider";

export default function FavouritesPage() {
  const { sevimlilar, tayyor } = useStore();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Navbar />

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
          <Link href="/" className="no-underline hover:text-zinc-700">
            Bosh sahifa
          </Link>
          <span>/</span>
          <span className="text-zinc-700">Sevimlilar</span>
        </nav>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Sevimlilar
        </h1>
        <p className="mt-2 text-zinc-500">
          Saqlab qo&apos;ygan mahsulotlaringiz.
        </p>

        {!tayyor ? null : sevimlilar.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sevimlilar.map((m) => (
              <ProductCard key={m.id} mahsulot={m} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-400 shadow-sm">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </div>
      <p className="mt-4 text-sm text-zinc-500">
        Sevimlilar ro&apos;yxati hozircha bo&apos;sh.
      </p>
      <Link
        href="/products"
        className="mt-4 inline-block rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-zinc-800"
      >
        Mahsulotlarni ko&apos;rish
      </Link>
    </div>
  );
}
