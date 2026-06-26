"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useStore } from "@/components/site/StoreProvider";

const links = [
  { href: "/#kategoriyalar", label: "Kategoriyalar" },
  { href: "/products", label: "Mahsulotlar" },
  { href: "/#nega-broller", label: "Nega Broller" },
  { href: "/#aloqa", label: "Aloqa" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [kirgan, setKirgan] = useState(false);
  const [ism, setIsm] = useState<string | null>(null);
  const router = useRouter();
  const { savatSoni, sevimliSoni, tayyor } = useStore();

  useEffect(() => {
    const supabase = createSupabaseBrowser();

    const yangila = (
      u: {
        user_metadata?: { full_name?: string; phone?: string };
        phone?: string;
      } | null,
    ) => {
      setKirgan(!!u);
      setIsm(
        u?.user_metadata?.full_name || u?.user_metadata?.phone || u?.phone || null,
      );
    };

    supabase.auth.getUser().then(({ data }) => yangila(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      yangila(session?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function chiqish() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* brand */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-900 no-underline"
        >
          Broller
        </Link>

        {/* desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm font-medium text-zinc-600 no-underline transition-colors hover:text-zinc-900"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* right */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* sevimlilar */}
          <Link
            href="/favourites"
            aria-label="Sevimlilar"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            <HeartIcon />
            {tayyor && sevimliSoni > 0 && <CountBadge n={sevimliSoni} />}
          </Link>

          {/* savat */}
          <Link
            href="/cart"
            aria-label="Savat"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            <BagIcon />
            {tayyor && savatSoni > 0 && <CountBadge n={savatSoni} />}
          </Link>

          <span className="mx-1 hidden h-6 w-px bg-zinc-200 md:block" />

          {kirgan ? (
            <div className="hidden items-center gap-3 md:flex">
              {ism && (
                <span className="max-w-[150px] truncate text-sm font-medium text-zinc-700">
                  {ism}
                </span>
              )}
              <button
                type="button"
                onClick={chiqish}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                Chiqish
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-zinc-800 md:inline-block"
            >
              Kirish
            </Link>
          )}

          {/* mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menyu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 md:hidden"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {open ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* mobile panel */}
      {open && (
        <div className="border-t border-zinc-200 bg-white md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 no-underline hover:bg-zinc-100"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              {kirgan ? (
                <button
                  type="button"
                  onClick={chiqish}
                  className="mt-1 block w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-center text-sm font-semibold text-zinc-700"
                >
                  Chiqish{ism ? ` (${ism})` : ""}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-xl bg-zinc-900 px-3 py-2.5 text-center text-sm font-semibold text-white no-underline"
                >
                  Kirish
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
