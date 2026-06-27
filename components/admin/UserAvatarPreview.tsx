"use client";

import { useEffect, useState } from "react";

export default function UserAvatarPreview({
  avatarUrl,
  name,
}: {
  avatarUrl: string | null;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const initial = (name.trim()[0] || "X").toUpperCase();

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => setOpen(false), 8000);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${name || "Xaridor"} avatarini kattaroq ko'rish`}
        className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name || "Foydalanuvchi avatari"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[10px] font-bold text-zinc-400">{initial}</span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-56 w-56 items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={name || "Foydalanuvchi avatari"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-7xl font-bold text-zinc-400">
                  {initial}
                </span>
              )}
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold text-white">
                {name || "Xaridor"}
              </h2>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
