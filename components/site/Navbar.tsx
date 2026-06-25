"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/#kategoriyalar", label: "Kategoriyalar" },
  { href: "/#mahsulotlar", label: "Mahsulotlar" },
  { href: "/#nega-broller", label: "Nega Broller" },
  { href: "/#aloqa", label: "Aloqa" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-zinc-800 md:inline-block"
          >
            Kirish
          </Link>

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
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-xl bg-zinc-900 px-3 py-2.5 text-center text-sm font-semibold text-white no-underline"
              >
                Kirish
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
