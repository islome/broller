import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              Broller
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
              Broyler yetishtirish uchun zamonaviy texnika va uskunalar
              marketplace&apos;i.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Bo&apos;limlar
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#kategoriyalar" className="text-zinc-600 no-underline hover:text-zinc-900">Kategoriyalar</Link></li>
              <li><Link href="/#mahsulotlar" className="text-zinc-600 no-underline hover:text-zinc-900">Mahsulotlar</Link></li>
              <li><Link href="/#nega-broller" className="text-zinc-600 no-underline hover:text-zinc-900">Nega Broller</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Kompaniya
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#aloqa" className="text-zinc-600 no-underline hover:text-zinc-900">Aloqa</Link></li>
              <li><Link href="/login" className="text-zinc-600 no-underline hover:text-zinc-900">Kirish</Link></li>
              <li><Link href="/register" className="text-zinc-600 no-underline hover:text-zinc-900">Ro&apos;yxatdan o&apos;tish</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Aloqa
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>+998 (90) 123-45-67</li>
              <li>info@broller.uz</li>
              <li>Toshkent, O&apos;zbekiston</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} Broller. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
