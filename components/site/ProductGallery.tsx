"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const safe = images.length ? images : ["/farm1.jpg"];
  const [active, setActive] = useState(0);
  const i = Math.min(active, safe.length - 1);
  const kop = safe.length > 1;

  const oldingi = () => setActive((i - 1 + safe.length) % safe.length);
  const keyingi = () => setActive((i + 1) % safe.length);

  return (
    <div>
      {/* asosiy rasm */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
        <Image
          key={i}
          src={safe[i]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />

        {kop && (
          <>
            <button
              type="button"
              onClick={oldingi}
              aria-label="Oldingi rasm"
              className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow-sm backdrop-blur transition-transform hover:scale-105"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={keyingi}
              aria-label="Keyingi rasm"
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow-sm backdrop-blur transition-transform hover:scale-105"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {i + 1} / {safe.length}
            </span>
          </>
        )}
      </div>

      {/* thumbnaillar */}
      {kop && (
        <div className="mt-3 grid grid-cols-5 gap-2.5">
          {safe.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`${idx + 1}-rasm`}
              aria-current={idx === i}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-zinc-100 transition-colors ${
                idx === i
                  ? "border-zinc-900"
                  : "border-transparent hover:border-zinc-300"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
