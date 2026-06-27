"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Boshqaruv paneli", icon: "grid" },
  { href: "/admin/orders", label: "Buyurtmalar", icon: "bag" },
  { href: "/admin/products", label: "Mahsulotlar", icon: "box" },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: "users" },
];

export default function AdminNav({ ism }: { ism: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function chiqish() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const aktivMi = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-white px-4 py-6 lg:flex">
        <Link
          href="/admin"
          className="px-3 text-lg font-bold tracking-tight text-zinc-900 no-underline"
        >
          Broller <span className="text-zinc-400">Admin</span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={navCls(aktivMi(l.href))}>
              <NavIcon name={l.icon} />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-zinc-200 pt-4">
          <p className="truncate px-3 text-sm font-medium text-zinc-700">
            {ism || "Admin"}
          </p>
          <Link
            href="/"
            className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 no-underline transition-colors hover:bg-zinc-100"
          >
            <NavIcon name="external" />
            Saytni ko&apos;rish
          </Link>
          <button
            type="button"
            onClick={chiqish}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
          >
            <NavIcon name="logout" />
            Chiqish
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white lg:hidden">
        <div className="flex items-center justify-between px-5 py-3">
          <Link
            href="/admin"
            className="text-base font-bold tracking-tight text-zinc-900 no-underline"
          >
            Broller <span className="text-zinc-400">Admin</span>
          </Link>
          <button
            type="button"
            onClick={chiqish}
            className="text-sm font-semibold text-zinc-600"
          >
            Chiqish
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                aktivMi(l.href)
                  ? "whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white no-underline"
                  : "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 no-underline hover:bg-zinc-100"
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}

function navCls(active: boolean) {
  return active
    ? "flex items-center gap-3 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white no-underline"
    : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 no-underline transition-colors hover:bg-zinc-100";
}

function NavIcon({ name }: { name: string }) {
  const c = {
    width: 18,
    height: 18,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  } as const;
  if (name === "grid")
    return (
      <svg {...c}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    );
  if (name === "users")
    return (
      <svg {...c}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    );
  if (name === "box")
    return (
      <svg {...c}>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  if (name === "bag")
    return (
      <svg {...c}>
        <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    );
  if (name === "external")
    return (
      <svg {...c}>
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    );
  return (
    <svg {...c}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
