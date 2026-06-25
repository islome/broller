import Link from "next/link";
import Image from "next/image";
import type { Mahsulot } from "@/lib/types";
import { formatNarx } from "@/lib/format";

export default function ProductCard({ mahsulot }: { mahsulot: Mahsulot }) {
  const rasm = mahsulot.asosiy_rasm || "/farm1.jpg";
  const chegirma =
    mahsulot.chegirma_narxi && mahsulot.chegirma_narxi < mahsulot.narxi;

  return (
    <Link
      href="/#aloqa"
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white no-underline transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)]"
    >
      {/* rasm */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        <Image
          src={rasm}
          alt={mahsulot.nomi}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {mahsulot.tavsiya_etilgan && (
          <span className="absolute left-3 top-3 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white">
            Tavsiya
          </span>
        )}
        {mahsulot.ombor_soni === 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white">
            Tugagan
          </span>
        )}
      </div>

      {/* tana */}
      <div className="flex flex-1 flex-col p-4">
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

        <div className="mt-3 flex items-end justify-between gap-2 pt-1">
          <div>
            {chegirma ? (
              <>
                <p className="text-base font-bold text-zinc-900">
                  {formatNarx(mahsulot.chegirma_narxi!, mahsulot.valyuta)}
                </p>
                <p className="text-xs text-zinc-400 line-through">
                  {formatNarx(mahsulot.narxi, mahsulot.valyuta)}
                </p>
              </>
            ) : (
              <p className="text-base font-bold text-zinc-900">
                {formatNarx(mahsulot.narxi, mahsulot.valyuta)}
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 transition-colors group-hover:text-zinc-600">
            Batafsil
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="transition-transform group-hover:translate-x-0.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
